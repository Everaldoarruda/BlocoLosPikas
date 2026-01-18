@echo off
echo Iniciando Sistema...
echo Por favor, nao feche esta janela enquanto estiver usando o sistema.
echo.
echo 1. Iniciando servidor web (necessario para o sistema funcionar)...
call npx -y http-server ./ -p 8080 -o -c-1

echo.
echo Servidor parado. Pode fechar a janela.
