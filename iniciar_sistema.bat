@echo off
echo Iniciando Servidor de Camisas...
echo Por favor, nao feche esta janela enquanto estiver usando o sistema.
echo.
echo 1. Ligando banco de dados...
start /min npx json-server db.json --port 3001

echo 2. Aguardando servidor iniciar...
timeout /t 5 >nul

echo 3. Abrindo sistema...
start index.html

echo.
echo Tudo pronto! Pode usar.
