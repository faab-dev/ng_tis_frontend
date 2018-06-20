<?php

class RequestMan
{
    const GET       = 'GET';
    const POST      = 'POST';
    const DELETE    = 'DELETE';
    const PUT       = 'PUT';
    const PATCH     = 'PATCH';
    const JSON      = 'application/json';
    const IMAGE      = 'image/jpeg';

    const REQUEST_NORMAL = 'REQUEST_NORMAL';
    const REQUEST_TOKEN_REFRESH = 'REQUEST_TOKEN_REFRESH';
    const REQUEST_REPEATED = 'REQUEST_REPEATED';

    private $ch;
    private $authorization = true;
    private $contentType = self::JSON;

    private $defaultHeader = [

    ];


    private $request_status = null;
    private $saved_request = null;
    private $isAjax = false;

    public static function newInstance()
    {
        return new RequestMan();
    }

    function __construct()
    {
        $this->request_status = self::REQUEST_NORMAL;
        $this->ch = curl_init();

    }

    function __destruct()
    {
        if(gettype($this->ch) == 'resource') curl_close($this->ch);
    }

    private function _prepareHeader($header_input) {
        $header = []; // array_merge($header, $this->defaultHeader);
        $header['Content-Type'] = $this->contentType;
        $header['X-OE-APP-KEY'] = X_OE_APP_KEY_CURRENT;

        $header_end = array_merge($header_input, $header);

        $finHeader = [];
        foreach ($header_end as $key => $value) {
            $finHeader[] = "$key:$value";
        }
        return $finHeader;
    }

    private function _send($url, $method, array $params, array $header)
    {

        $_header = $header;

        $header = $this->_prepareHeader($header);


        /*print "url";
        print "<pre>";
                var_dump($url);
                print "</pre>";
        
        print "header";
        print "<pre>";
                var_dump($header);
                print "</pre>";
        
        print "method";
        print "<pre>";
                var_dump($method);
                print "</pre>";
        
        print "params";
        print "<pre>";
                var_dump($params);
                print "</pre>";*/

        $response = $this->set_curl_setopt($url, $method, $params, $header);


//

// $response['req_extra1'] = $_header;



// @TODO CREATE REFRESH TOKEN

        /*print "response";
        print "<pre>";
                var_dump($response);
                print "</pre>";
        exit(0);*/




        $response['request_headers'] = $header;
        $response['url'] = $url;
        $response['method'] = $method;


        return $response;
    }

    public function withoutAuthorization() {
        $this->authorization = false;
        return $this;
    }

    public function enableAjax() {
        $this->isAjax = true;
        return $this;
    }

    public function contentType($type) {
        $this->contentType = $type;
        return $this;
    }

    private function getRefreshToken($url, $method, $params, $header){



        /*$header['Content-Type'] = $this->contentType;
        $header['X-OE-APP-KEY'] = X_OE_APP_KEY_CURRENT;
        $header['X-OE-UAPP-KEY'] = ADMIN_APP_ID;
        
        $finHeader = [];
        foreach ($header as $key => $value) {
        $finHeader[] = "$key:$value";
        }*/

        $header = $this->_prepareHeader($header);

        /*print "getRefreshToken url";
        print "<pre>";
                var_dump($url);
                print "</pre>";
        
        print "getRefreshToken method";
        print "<pre>";
                var_dump($method);
                print "</pre>";
        
        print "getRefreshToken params";
        print "<pre>";
                var_dump($params);
                print "</pre>";
        
        print "getRefreshToken header";
        print "<pre>";
                var_dump($header);
                print "</pre>";*/



        $this->ch = curl_init();
        $response = $this->set_curl_setopt($url, $method, $params, $header);

        /*print "getRefreshToken response";
        print "<pre>";
                var_dump($response);
                print "</pre>";*/
        /*exit(0);*/


// exit(0);

        $headers = array();

        if( !empty($response['body']) && !empty($response['code']) && $response['code'] === 200){

            $body = Json::decode($response['body']);

            if( is_array($body) && !empty($body['refreshToken']) && !empty($body['accessToken']) ){
                $identity = Yii::$app->user->identity;
                Yii::$app->user->identity->accessToken = $identity->accessToken = $body['accessToken'];
                Yii::$app->user->identity->refreshToken = $identity->refreshToken = $body['refreshToken'];
// $identity->accessTTL = $body['accessTTL'];
                Yii::$app->user->setIdentity($identity);

                foreach ($header as $key => $head){
                    if (strpos($head, 'Authorization:') !== false) {
                        $header[$key] = 'Authorization:'.$identity->accessToken;
                    }
                }

                $headers = $header;

                /*print "getRefreshToken header BEFORE _prepareHeader";
                print "<pre>";
                                var_dump($header);
                                print "</pre>";*/
            }
        }

        return $headers;
    }

    public function send($url, $method = RequestMan::GET, array $params = [], array $header = [], $secondary = false) {


        $_header = $header;

        /*if ($this->authorization) {

            $o_user_identify = Yii::$app->user->getIdentity();

            $token = "";

            if( is_array( $o_user_identify ) ){
                $token = $o_user_identify['accessToken'];
            }else if( is_object($o_user_identify) ){
                $token = $o_user_identify->accessToken;
            }

            $_header['Authorization'] = $token;
        }*/

        $response =  $this->_send($url, $method, $params, $_header);
        if(gettype($this->ch) == 'resource') curl_close($this->ch);

// $response['request_headers'] = $_header;

        return $response;
    }

    public function sendFile($url, $file, $method = RequestMan::PUT, $header = []) {
// $url = UrlHelper::createUploadFile($url);


        if ($this->authorization) {
            $token = Yii::$app->user->getIdentity()['accessToken'];
            $header['Authorization'] = $token;
        } else {

        }

        $header = $this->_prepareHeader($header);

        curl_setopt($this->ch, CURLOPT_URL, $url);
        curl_setopt($this->ch, CURLOPT_HTTPHEADER, $header);
        curl_setopt($this->ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($this->ch, CURLOPT_POSTFIELDS,  $file);
        curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, 1);

        $body = curl_exec($this->ch);
        $code = curl_getinfo ($this->ch, CURLINFO_HTTP_CODE );

        Yii::info('UploadFile');
        Yii::info($method . ' ' . $url, 'request');
        Yii::info($code . ' => ' . $body, 'request');

        if ($code === 401) {
            Yii::$app->user->logout();
            Yii::$app->controller->redirect(Url::toRoute(Yii::$app->user->loginUrl));
        }

        return ['code' => $code, 'body' => $body];
    }

    public static function bedRequest($code, $message) {
        return ['code'=>$code, 'body' => $message];
    }

    public static function isSuccess($response, $codeSuccess = 200) {
        return $response['code'] == $codeSuccess;
    }

    private function set_curl_setopt($url, $method, $params, $header_inner){
        curl_setopt($this->ch, CURLOPT_URL, $url);
        curl_setopt($this->ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($this->ch, CURLOPT_POSTFIELDS,  json_encode($params));
        curl_setopt($this->ch, CURLOPT_HTTPHEADER, $header_inner);
        curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($this->ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($this->ch, CURLOPT_TIMEOUT, 30); //CURLOPT_CONNECTTIMEOUT
        curl_setopt($this->ch, CURLOPT_CONNECTTIMEOUT, 30);

        curl_setopt($this->ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($this->ch, CURLOPT_VERBOSE, 1);
        curl_setopt($this->ch, CURLOPT_HEADER, 1);

        $response = curl_exec($this->ch);

// get headers from responce

        $explode_list = explode("\r\n\r\n", $response, 2);
        /*print "explode_list";
        print "<pre>";
                var_dump($explode_list);
                print "</pre>";
        exit(0);*/


        if(!empty($explode_list[0]) && !empty($explode_list[1]) ){
            list($headers, $body) = explode("\r\n\r\n", $response, 2);
            $headers = explode("\n", $headers);
            $headers_allowed = [];
            foreach ($headers as $header){
                $header_parts = explode(":", $header);
                if(count($header_parts) == 2){
                    $headers_allowed[trim($header_parts[0])] = trim($header_parts[1]);
                }
            }

            /*return array(
            'body' => curl_exec($this->ch),
            'code' => curl_getinfo ($this->ch, CURLINFO_HTTP_CODE ),
            );*/

            return array(
                'body' => $body,
                'code' => curl_getinfo ($this->ch, CURLINFO_HTTP_CODE ),
                'headers' => $headers_allowed,
                'params' => $params,
                'inner_headers' => $header_inner,
            );
        }

        return array(
            'body' => '',
            'code' => curl_getinfo ($this->ch, CURLINFO_HTTP_CODE ),
            'headers' => array(),
            'explode_list_empty' => $explode_list,
            'inner_headers' => $header_inner,
            'res_empty' => $response,
        );

    }
}