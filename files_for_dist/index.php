<?php

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
if( isset($_COOKIE[COOKIE_PREFIX.'url_fe_ars']) ){
    helperUnsetcookie(COOKIE_PREFIX.'url_fe_ars');
}
if( isset($_COOKIE[COOKIE_PREFIX.'url_be_ars']) ){
    helperUnsetcookie(COOKIE_PREFIX.'url_be_ars');
}
if( isset($_COOKIE[COOKIE_PREFIX.'X_OE_APP_KEY_CURRENT']) ){
    helperUnsetcookie(COOKIE_PREFIX.'X_OE_APP_KEY_CURRENT');
}
if( isset($_COOKIE[COOKIE_PREFIX.'CONFIG_ALLOWED_ROLES']) ){
    helperUnsetcookie(COOKIE_PREFIX.'CONFIG_ALLOWED_ROLES');
}

// Remove old used cookies
if( isset($_COOKIE[COOKIE_PREFIX.'url_be_tis']) ){
    helperUnsetcookie(COOKIE_PREFIX.'url_be_tis');
}
if( isset($_COOKIE[COOKIE_PREFIX.'user_name']) ){
    helperUnsetcookie(COOKIE_PREFIX.'user_name');
}
if( isset($_COOKIE[COOKIE_PREFIX.'auth_phones']) ){
    helperUnsetcookie(COOKIE_PREFIX.'auth_phones');
}
if( isset($_COOKIE[COOKIE_PREFIX.'user_roles']) ){
    helperUnsetcookie(COOKIE_PREFIX.'user_roles');
}
if( isset($_COOKIE[COOKIE_PREFIX.'INSTALLER']) ){
    helperUnsetcookie(COOKIE_PREFIX.'INSTALLER');
}
if( isset($_COOKIE[COOKIE_PREFIX.'avatar']) ){
    helperUnsetcookie(COOKIE_PREFIX.'avatar');
}

$CONFIG_SECURE = (CONFIG_SECURE === 1) ? true : false;

function helperUnsetcookie($name){
    if( isset($_COOKIE[$name]) ) unset($_COOKIE[$name]);
    setcookie($name, "", time()-3600);
}

function helperExpire(){
    return time()+CONFIG_EXPIRE;
}

function helperRemoveAllCookies(){

    if ( !empty($_SERVER['HTTP_COOKIE'])  ) {
        $cookies = explode(';', $_SERVER['HTTP_COOKIE']);

        if( !empty($cookies) && is_array($cookies) ){
            foreach($cookies as $cookie) {
                $parts = explode('=', $cookie);
                $cookie_name = trim($parts[0]);

                $has_prefix = strpos($cookie_name, COOKIE_PREFIX);
                $has_uapp_key = strpos($cookie_name, 'x_oe_uapp_key');
                $has_refreshToken = strpos($cookie_name, 'refreshToken');
                // $has_url_tis_be = strpos($cookie_name, 'url_tis_be'); // url_tis_be

                if( $has_prefix !== false && $has_uapp_key === false /*&& $has_url_tis_be === false*/){
                    setcookie($cookie_name, '', time()-1000);
                    setcookie($cookie_name, '', time()-1000, '/');
                }


            }
        }


    }

    if( !empty($_COOKIE) && is_array($_COOKIE)){
        foreach ($_COOKIE as $cookie_value => $cookie_name){
            $has_prefix = strpos($cookie_name, COOKIE_PREFIX);
            $has_uapp_key = strpos($cookie_name, 'x_oe_uapp_key');
            $has_refreshToken = strpos($cookie_name, 'refreshToken');
            $has_url_tis_be = strpos($cookie_name, 'url_tis_be');
            if( $has_prefix !== false && $has_uapp_key === false  && $has_url_tis_be === false ){
                unset($_COOKIE[$cookie_name]);
            }
        }
    }

}

function checkAuthCookies(){
    if(
        isset($_COOKIE[COOKIE_PREFIX.'x_oe_uapp_key'])
        && isset($_COOKIE[COOKIE_PREFIX.'accessToken'])
        && isset($_COOKIE[COOKIE_PREFIX.'user_id'])
    ){
        $flag_all_cookies = true;
    }else{
        if(
            !isset($_COOKIE[COOKIE_PREFIX.'x_oe_uapp_key'])
            || $_COOKIE[COOKIE_PREFIX.'x_oe_uapp_key'] == ''
            || $_COOKIE[COOKIE_PREFIX.'x_oe_uapp_key'] == 'false'
            || $_COOKIE[COOKIE_PREFIX.'x_oe_uapp_key'] == 'undefined'

        ){
            helperUnsetcookie(COOKIE_PREFIX.'x_oe_uapp_key');
        }
        helperUnsetcookie(COOKIE_PREFIX.'accessToken');
        helperUnsetcookie(COOKIE_PREFIX.'user_id');
    }
}

function getImageFromImageId ($image_id, $type, $index){

    $image_type = 'image/';
    if( $image_id && $image_id !== 'false' ){

        if( $type == 'gallery' ){


            if(!isset($_COOKIE[COOKIE_PREFIX.'url_tis_be'])){
                $url = '/public/images/ic_loading.jpg';
                $image_type .= 'jpeg';
                $default_image = '/public/images/ic_loading.jpg';
            }else{
                $url = $_COOKIE[COOKIE_PREFIX.'url_tis_be'].'file/'.$image_id;
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
        $_COOKIE[COOKIE_PREFIX.'accessToken'],
        $_COOKIE[COOKIE_PREFIX.'x_oe_uapp_key']
    ))
    {
        $head = [
            'X-OE-APP-KEY' => X_OE_APP_KEY_CURRENT,
            'X-OE-UAPP-KEY'=>$_COOKIE[COOKIE_PREFIX.'x_oe_uapp_key'],
            'Authorization'=>$_COOKIE[COOKIE_PREFIX.'accessToken'],
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


$controller = false;

// set $controller
if( isset($_SERVER['REQUEST_URI']) && is_string($_SERVER['REQUEST_URI']) ){
    $uri = explode('/', $_SERVER['REQUEST_URI']);
    if( !empty($uri[1])){
        $controller = strtolower($uri[1]);
    }

    if( $controller == 'refreshtoken'){

        checkAuthCookies();

        $result =  RequestMan::newInstance()->send(
            URL_BE_ARS.'token/refresh',
            RequestMan::POST,
            [
                'refreshToken'=>$_COOKIE[COOKIE_PREFIX.'refreshToken']
            ],
            [
                'X-OE-APP-KEY' => X_OE_APP_KEY_CURRENT,
                'X-OE-UAPP-KEY'=>$_COOKIE[COOKIE_PREFIX.'x_oe_uapp_key'],
                'Authorization'=>$_COOKIE[COOKIE_PREFIX.'accessToken'],
            ]
        );

        $res['code'] = $result['code'] ;
        if( $result['code'] == 200 ){
            $bode = json_decode($result['body'] );
            $res['accessToken'] = $bode->accessToken;

            setcookie(COOKIE_PREFIX.'accessToken', $bode->accessToken, helperExpire(), '/', '', $CONFIG_SECURE, false);
            setcookie(COOKIE_PREFIX.'refreshToken', $bode->refreshToken, helperExpire(), '/', '', $CONFIG_SECURE, true);
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

}

checkAuthCookies();

require $_SERVER['DOCUMENT_ROOT'].'/index.html';