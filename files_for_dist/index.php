<?php


if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // return only the headers and not the content
    // only allow CORS if we're doing a GET - i.e. no saving for now.
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    exit;
}

// header('HTTP/1.0 '.$status.' '.$message);
// http_response_code($status);
// throw new Exception($message, $status);
// header_remove();
// set the actual code


error_reporting(E_ALL);
ini_set('display_errors', 1);

$dir_php = $_SERVER['DOCUMENT_ROOT'].'/private/php/';

require_once($dir_php.'config/server_config.php');
require_once($dir_php.'libs/RequestMan.php');

if( !class_exists('RequestMan') ){
    actionSetError('Library not found', 500);
    exit(401);
}

// Remove config cookies - config data setted by JS (see bottom of html-page)
if( isset($_COOKIE['url_fe_ars']) ){
    helperUnsetcookie('url_fe_ars');
}
if( isset($_COOKIE['url_be_ars']) ){
    helperUnsetcookie('url_be_ars');
}
if( isset($_COOKIE['X_OE_APP_KEY_CURRENT']) ){
    helperUnsetcookie('X_OE_APP_KEY_CURRENT');
}
if( isset($_COOKIE['CONFIG_ALLOWED_ROLES']) ){
    helperUnsetcookie('CONFIG_ALLOWED_ROLES');
}

// Remove old used cookies
if( isset($_COOKIE['url_be_tis']) ){
    helperUnsetcookie('url_be_tis');
}
if( isset($_COOKIE['user_name']) ){
    helperUnsetcookie('user_name');
}
if( isset($_COOKIE['auth_phones']) ){
    helperUnsetcookie('auth_phones');
}
if( isset($_COOKIE['user_roles']) ){
    helperUnsetcookie('user_roles');
}
if( isset($_COOKIE['INSTALLER']) ){
    helperUnsetcookie('INSTALLER');
}
if( isset($_COOKIE['avatar']) ){
    helperUnsetcookie('avatar');
}

$CONFIG_SECURE = (CONFIG_SECURE === 1) ? true : false;

function helperUnsetcookie($name){
    if( isset($_COOKIE[$name]) ) unset($_COOKIE[$name]);
    setcookie($name, "", time()-3600);
}

function helperExpire(){
    return time()+2592000;
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

function checkAuthCookies(){
    if(
        isset($_COOKIE['x_oe_uapp_key'])
        && isset($_COOKIE['accessToken'])
        && isset($_COOKIE['user_id'])
    ){
        $flag_all_cookies = true;
    }else{
        if(
            !isset($_COOKIE['x_oe_uapp_key'])
            || $_COOKIE['x_oe_uapp_key'] == ''
            || $_COOKIE['x_oe_uapp_key'] == 'false'
            || $_COOKIE['x_oe_uapp_key'] == 'undefined'

        ){
            helperUnsetcookie('x_oe_uapp_key');
        }
        helperUnsetcookie('accessToken');
        helperUnsetcookie('user_id');
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

function signin(){
    if( empty($_POST['otp']) || empty($_POST['phone']) ) actionSetError('Bad request: invalid data', 400);
    $X_OE_APP_KEY_CURRENT = (!empty($_COOKIE['X_OE_APP_KEY_CURRENT'])) ? $_COOKIE['X_OE_APP_KEY_CURRENT'] : X_OE_APP_KEY_CURRENT;
    $result =  RequestMan::newInstance()->withoutAuthorization()->send(
        URL_BE_ARS.'user/phone/signin/'.$_POST['phone'], RequestMan::POST, ['otp' => $_POST['otp']], [
            'X-OE-UAPP-KEY' => $_COOKIE['x_oe_uapp_key'],
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
    header('Status: '.$status_string);
// return the encoded json
    print json_encode(array(
        'error' => true,
        'status' => $code, // success or not?
        'message' => $message
    ));
    die($code);
}

function signinLogin (){
    $post = $_POST;
    if( empty($post) ){
        $post = json_decode(file_get_contents("php://input"), true);
    }

    if( empty($post) || empty($post['login']) || empty($post['password']) || empty($post['x_oe_uapp_key']) ){
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
        URL_BE_ARS.'/user/signin', RequestMan::POST, ['login'=>$post['login'],'password'=>$post['password'] ], [
            'X-OE-UAPP-KEY' => $post['x_oe_uapp_key'],
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

    print json_encode([
        'user_id' => $response->user->id,
        'access_token' => $response->accessToken
    ]);
    exit(200);
}


$controller = false;

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

        checkAuthCookies();

        $result =  RequestMan::newInstance()->send(
            URL_BE_ARS.'token/refresh',
            RequestMan::POST,
            [
                'refreshToken'=>$_COOKIE['refreshToken']
            ],
            [
                'X-OE-APP-KEY' => X_OE_APP_KEY_CURRENT,
                'X-OE-UAPP-KEY'=>$_COOKIE['x_oe_uapp_key'],
                'Authorization'=>$_COOKIE['accessToken'],
            ]
        );

        $res['code'] = $result['code'] ;
        if( $result['code'] == 200 ){
            $bode = json_decode($result['body'] );
            $res['accessToken'] = $bode->accessToken;

            setcookie('accessToken', $bode->accessToken, helperExpire(), '/', '', $CONFIG_SECURE, false);
            setcookie('refreshToken', $bode->refreshToken, helperExpire(), '/', '', $CONFIG_SECURE, true);
        }

        print json_encode($res);

        exit(200);
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

    if( $controller == 'init-data' ){
        $res = [
            'x_oe_app_key' => X_OE_APP_KEY_CURRENT,
            'url_ars_be' => URL_BE_ARS
        ];

        print json_encode($res);
        exit(200);
    }

    if( $controller == 'signin' ){
        signin();
        exit(200);
    }

    if( $controller == 'signinlogin' ){
        signinLogin();
        exit(200);
    }

}

checkAuthCookies();

require $_SERVER['DOCUMENT_ROOT'].'/index.html';
