## Локальная установка проекта

Скопировать репозиторий в папку 
`mkdir ng.tis-fronend`
`git clone git@github.com:faab-dev/ng_tis_frontend.git www`
`cd www`
`npm update`

Компилируем production (для дебага во время разработки - смотреть `/src/proxy.conf.json` )
`ng build tis-frontend`

Скопировать в папку `/dist/tis-frontend` файлы из `/file_for_dist` (всё, кроме `nginx-setup.txt`)


Создать в `/ext/nginx/sites-available` файл `ng.tis-frontend` и скопировтаь настройки из `/file_for_dist/nginx-setup.txt`
Создать ссылку в `/etc/nginx/sites-enabled/`: 
`sudo /ext/nginx/sites-enabled;`
`sudo ln -sfv ../sites-available/ng.tis-frontend .`  (точка на конце обязательна)

`sudo service nginx restart`

Затем заупскаем ng serve из `ng.tis-fronend/www/`