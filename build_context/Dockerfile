FROM php:8.3-apache

RUN apt-get update && apt-get install -y \
    libicu-dev libzip-dev libpng-dev libjpeg-dev libfreetype6-dev git unzip librabbitmq-dev locales \
    && echo "en_US.UTF-8 UTF-8" > /etc/locale.gen \
    && locale-gen \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install intl pdo pdo_mysql zip gd exif \
    && pecl install amqp \
    && docker-php-ext-enable amqp \
    && a2enmod rewrite

ENV LC_ALL=en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html

RUN COMPOSER_MEMORY_LIMIT=-1 composer create-project pimcore/skeleton . \
    && COMPOSER_MEMORY_LIMIT=-1 composer require pimcore/data-hub league/flysystem-google-cloud-storage

RUN grep -q "PimcoreDataHubBundle" config/bundles.php || sed -i "s/return \[/return \[\n    Pimcore\\\\Bundle\\\\DataHubBundle\\\\PimcoreDataHubBundle::class => ['all' => true],/" config/bundles.php

COPY config/packages/ /var/www/html/config/packages/

RUN echo '<VirtualHost *:8080>\n\
    DocumentRoot /var/www/html/public\n\
    <Directory /var/www/html/public>\n\
        AllowOverride All\n\
        Require all granted\n\
        FallbackResource /index.php\n\
    </Directory>\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf \
    && echo "Listen 8080" > /etc/apache2/ports.conf

RUN echo '#!/bin/bash\n\
echo "PassEnv DATABASE_URL PIMCORE_DB_DSN APP_SECRET PIMCORE_INSTALL_ENCRYPTION_SECRET GOOGLE_CLOUD_PROJECT GCS_BUCKET_NAME SYMFONY_DOTENV_PATH" > /etc/apache2/conf-enabled/passenv.conf\n\
rm -rf /var/www/html/var/cache/* || true\n\
php bin/console pimcore:bundle:install PimcoreDataHubBundle --no-interaction || true\n\
php bin/console cache:clear --no-interaction || true\n\
# THE FIX: Create ALL required directories before starting Apache\n\
mkdir -p /var/www/html/var/admin /var/www/html/var/config/data_hub /var/www/html/public/var\n\
chown -R www-data:www-data /var/www/html/var /var/www/html/public/var\n\
chmod -R 775 /var/www/html/var\n\
exec apache2-foreground' > /usr/local/bin/start.sh \
    && chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"]
