<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

$dir_php = $_SERVER['DOCUMENT_ROOT'].'/private/php/';
require_once($dir_php.'config/server_config.php');
require_once($dir_php.'libs/RequestMan.php');
$CONFIG_SECURE = (CONFIG_SECURE === 1) ? true : false;

function actionSetError($message, $code){
    http_response_code($code);

    $status = array(
        200 => '200 OK',
        400 => '400 Bad Request',
        401 => '401 Not accessible',
        402 => '402',
        403 => '403',
        404 => '404 Not found',
        422 => 'Unprocessable Entity',
        500 => '500 Internal Server Error',
        502 => '502 Internal Server Error'
    );
    $status_string = ( isset($status[$code]) ) ? $status[$code] : 'Internal Server Error';
// ok, validation error, or failure
    header('Status: '.$message/*$status_string*/);
// return the encoded json
    print json_encode(array(
        'error' => true,
        'status' => $message, // $code, // success or not?
        'message' => $message
    ));
    die($code);
}

function helperExpire(){
    return time()+2592000;
}

function printJson($result){
    header('Content-Type: application/json');
    echo json_encode($result);
    exit(200);
}

function signinPhone($post, $CONFIG_SECURE){
    if( empty($post['otp']) || empty($post['phone']) || empty($post['x_oe_uapp_key']) ){
        actionSetError('Bad request', 400);
        return;
    }
    $X_OE_APP_KEY_CURRENT = (!empty($_COOKIE['X_OE_APP_KEY_CURRENT'])) ? $_COOKIE['X_OE_APP_KEY_CURRENT'] : X_OE_APP_KEY_CURRENT;
    $result =  RequestMan::newInstance()->withoutAuthorization()->send(
        URL_BE_ARS.'/user/phone/signin/'.$post['phone'], RequestMan::POST, ['otp' => $post['otp']], [
            'X-OE-UAPP-KEY' => $post['x_oe_uapp_key'],
            'X-OE-APP-KEY' => $X_OE_APP_KEY_CURRENT,
        ]
    );

    if( !RequestMan::isSuccess($result) ) {
        print json_encode($result);
        exit(0);
        actionSetError('Not allowed result', 401);
    }


    $response = json_decode($result['body']);
}



function signinForm ($data, $CONFIG_SECURE){
    if( empty($data['login']) || empty($data['password']) || empty($data['x_oe_uapp_key']) ){
        /*print json_encode([
            'data' => $post,
            'post' => empty($post),
            'login' => empty($post['login']),
            'password' => empty($post['password']),
            'x_oe_uapp_key' => empty($post['x_oe_uapp_key']),
            'all0' => empty($post) || empty($post['login']) || empty($post['password']) || empty($post['x_oe_uapp_key'])
        ]);
        exit(200);*/
        actionSetError('Bad request', 400);
        return;
    }

    $result =  RequestMan::newInstance()->withoutAuthorization()->send(
        URL_BE_ARS.'/user/signin', RequestMan::POST, ['login'=>$data['login'],'password'=>$data['password'] ], [
            'X-OE-UAPP-KEY' => $data['x_oe_uapp_key'],
            'X-OE-APP-KEY' => X_OE_APP_KEY_CURRENT,
        ]
    );

    if( !RequestMan::isSuccess($result) ) {
        actionSetError('Not found (user)', (isset($result['code']) && is_integer($result['code']) ) ? $result['code'] : 404 );
        return;
    }

    $response = json_decode($result['body']);

    if( empty($response->accessToken) || empty($response->refreshToken) || empty($response->user) || empty($response->user->id) ){
        actionSetError('Bad request: incomplete server data', 401);
        return;
    }

    setcookie('refreshToken', $response->refreshToken, helperExpire(), '/', '', CONFIG_SECURE, true);

    printJson([
        'user_id' => $response->user->id,
        'access_token' => $response->accessToken
    ]);
}

function refreshToken($data, $CONFIG_SECURE){
    if( empty($data['user_id']) || empty($data['access_token']) || empty($data['x_oe_uapp_key']) ){
        actionSetError('Bad request', 400);
        return;
    }

    if( !isset($_COOKIE['refreshToken']) ){
        actionSetError('Bad request refreshToken', 400);
        return;
    }

    $result =  RequestMan::newInstance()->send(
        URL_BE_ARS.'/token/refresh',
        RequestMan::POST,
        [
            'refreshToken'=>$_COOKIE['refreshToken']
        ],
        [
            'X-OE-APP-KEY' => X_OE_APP_KEY_CURRENT,
            'X-OE-UAPP-KEY'=>$data['x_oe_uapp_key'],
            'Authorization'=>$data['access_token'],
        ]
    );

    /* printJson(['res' => $result]);
     exit(200);*/

    if( empty($result) || empty($result['code']) || empty($result['body']) || $result['code'] !== 200 ){


        actionSetError('Response is received, but incorrect', 401);
        return;
    }

    $body = json_decode($result['body'] );

    if( empty($body) || empty($body->refreshToken) || empty($body->accessToken) ){
        actionSetError('Response is not valid', 401);
        return;
    }

    setcookie('refreshToken', $body->refreshToken, helperExpire(), '/', '', $CONFIG_SECURE, true);


    printJson([
        'user_id' => $data['user_id'],
        'access_token' => $body->accessToken
    ]);
    return;
}


if( !class_exists('RequestMan') ){
    actionSetError('Library not found', 401);
    exit(401);
}

$post = json_decode(file_get_contents("php://input"), true);
if( empty($post) || empty($post['controller']) || !isset($post['data'])){
    actionSetError('Bad request', 400);
    exit(400);
}

switch( $post['controller'] ){
    case 'init-data':
        printJson([
            'x_oe_app_key' => X_OE_APP_KEY_CURRENT,
            'url_ars_be' => URL_BE_ARS
        ]);
        break;
    case 'signin-phone':
        signinPhone($post['data'], $CONFIG_SECURE);
        break;
    case 'signin-form':
        signinForm($post['data'], $CONFIG_SECURE);
        break;
    case 'refresh-token':
        refreshToken($post['data'], $CONFIG_SECURE);
        break;
    default:
        actionSetError('Page not found', 404);
        exit(404);
}

exit(200);


function helperUnsetcookie($name){
    if( isset($_COOKIE[$name]) ) unset($_COOKIE[$name]);
    setcookie($name, "", time()-3600);
}



function helperRemoveAllCookies(){

    if ( !empty($_SERVER['HTTP_COOKIE'])  ) {
        $cookies = explode(';', $_SERVER['HTTP_COOKIE']);

        if( !empty($cookies) && is_array($cookies) ){
            foreach($cookies as $cookie) {
                $parts = explode('=', $cookie);
                $cookie_name = trim($parts[0]);

                $has_uapp_key = strpos($cookie_name, 'x_oe_uapp_key');
                $has_refreshToken = strpos($cookie_name, 'refreshToken');
                // $has_url_tis_be = strpos($cookie_name, 'url_tis_be'); // url_tis_be

                if( $has_uapp_key === false /*&& $has_url_tis_be === false*/){
                    setcookie($cookie_name, '', time()-1000);
                    setcookie($cookie_name, '', time()-1000, '/');
                }


            }
        }


    }

    if( !empty($_COOKIE) && is_array($_COOKIE)){
        foreach ($_COOKIE as $cookie_value => $cookie_name){
            $has_uapp_key = strpos($cookie_name, 'x_oe_uapp_key');
            $has_refreshToken = strpos($cookie_name, 'refreshToken');
            $has_url_tis_be = strpos($cookie_name, 'url_tis_be');
            if( $has_uapp_key === false  && $has_url_tis_be === false ){
                unset($_COOKIE[$cookie_name]);
            }
        }
    }

}

function getImageFromImageId ($image_id, $type, $index){

    $image_type = 'image/';
    if( $image_id && $image_id !== 'false' ){

        if( $type == 'gallery' ){


            if(!isset($_COOKIE['url_tis_be'])){
                $url = '/public/images/ic_loading.jpg';
                $image_type .= 'jpeg';
                $default_image = '/public/images/ic_loading.jpg';
            }else{
                $url = $_COOKIE['url_tis_be'].'file/'.$image_id;
                $image_type .= 'jpeg';
                $default_image = '/public/images/ic_loading.jpg';
            }

            // @TODO ADD URL

        }elseif( $type == 'avatar' ){
            $url = URL_BE_ARS.'file/'.$image_id;
            $image_type .= 'png';
            // $default_image = './public/images/default_icon.svg';
            $default_image = 'http://'.$_SERVER['HTTP_HOST'].'/public/images/logo_menu.png';
        }elseif( $type == 'avatar-chat' ){
            $url = URL_BE_ARS.'user/avatar/'.$image_id;
            $image_type .= 'png';
            $default_image = 'http://'.$_SERVER['HTTP_HOST'].'/public/images/default_icon.png';
        }else{
            $image_type .= 'png';
            $default_image = '/public/images/default_icon.png';
        };
    }else{

        $http = ( isset( $_SERVER['HTTPS'] ) ) ? 'https' : 'http';
        $url = $http.'://'.$_SERVER['HTTP_HOST'].'/public/images/default_icon.png';
        $image_type .= 'png';
    }




    $image = false;
    if( isset(
        $_COOKIE['accessToken'],
        $_COOKIE['x_oe_uapp_key']
    ))
    {
        $head = [
            'X-OE-APP-KEY' => X_OE_APP_KEY_CURRENT,
            'X-OE-UAPP-KEY'=>$_COOKIE['x_oe_uapp_key'],
            'Authorization'=>$_COOKIE['accessToken'],
        ];

        $result =  RequestMan::newInstance()->send(
            $url, RequestMan::GET, [], $head
        );

        switch ($result['code']){
            case 200:
                $im = imagecreatefromstring($result['body']);

                header('Content-Type: '.$image_type);
                if( $type == 'gallery' ){
                    imagejpeg($im);
                }
                if( $type == 'avatar' || $type == 'avatar-chat' ){
                    imagepng($im);
                }

                imagedestroy($im);
                $image = true;
                break;
            case 403:
                $image = false;
                break;

            default:
                $image = false;




        }
    }
    if( !$image ){
        $type = 'image/png';
        header('Content-Type:'.$type);
        print file_get_contents($default_image);
        exit(200);
    }


}

// set $controller
if( isset($_SERVER['REQUEST_URI']) && is_string($_SERVER['REQUEST_URI']) ){
    $uri = explode('/', $_SERVER['REQUEST_URI']);
    if( !empty($uri[1])){
        $controller = strtolower($uri[1]);
    }

    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET,POST,OPTIONS,DELETE,PUT");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    /*actionSetError('Oops)', 413);
    die(413);*/


    if( $controller == 'refreshtoken'){


    }

    if( $controller == 'clearcookies'){
        helperRemoveAllCookies();

        $res = ['code'=>200];

        print json_encode($res);

        exit(200);
    }

    if( $controller == 'image' && !empty($uri[2]) && !empty($uri[3]) ){

        getImageFromImageId($uri[3], $uri[2], 0);
        exit(200);
    }


}

