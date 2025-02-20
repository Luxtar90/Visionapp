gradlew.bat clean assembleRelease@echo off
setx ANDROID_HOME "C:\Users\%USERNAME%\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools;%ANDROID_HOME%\tools\bin"
echo Android SDK path configurado correctamente
echo Por favor, reinicia tu terminal para que los cambios surtan efecto
pause
