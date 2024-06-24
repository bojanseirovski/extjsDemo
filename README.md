# Sencha app

## NPM
npm installation has an issue: https://stackoverflow.com/questions/54724299/unhandledpromiserejectionwarning-error-cannot-find-module-using-ext-gen

## Sencha CMD
export OPENSSL_CONF=/dev/null

sencha generate app --ext MyApp ./MyApp
sencha app watch
sencha app build -c classic