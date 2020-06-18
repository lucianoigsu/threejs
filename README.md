# threejs

# Escena de prueba

## Test

Para poder probar la escena:

$ docker run --rm -it -p 3100:3100 -v `pwd`:/app node:carbon /bin/bash
$ cd /app

## Init

Para correr primera vez y así instalar el modulo de ThreeJs:

$ ./scripts/init.sh

## Run

Si ya se instalaron los modulos por primera vez y solo se quiere correr el server:

$ ./scripts/run.sh
