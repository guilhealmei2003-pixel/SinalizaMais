
FROM php:8.3-apache

RUN docker-php-ext-install mysqli pdo_mysql

RUN a2enmod rewrite

RUN sed -i 's/Listen 80/Listen 10000/' /etc/apache2/ports.conf \
    && sed -i 's/<VirtualHost \*:80>/<VirtualHost *:10000>/' /etc/apache2/sites-available/000-default.conf

RUN printf '<Directory /var/www/html>\nAllowOverride All\nRequire all granted\n</Directory>\n' > /etc/apache2/conf-available/sinaliza.conf \
    && a2enconf sinaliza

COPY . /var/www/html/

EXPOSE 10000

CMD ["apache2-foreground"]
