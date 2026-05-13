
## Туториал как запустить проект
Но если ты вообще в этом не разбираешься
Устонови Codex/Cursor (ИИ которые могут работать с репой) и попроси их не ломая ничего запустить проект у себя на ПК 
## Что нужно установить

Перед запуском нужен Node.js. Рекомендуется Node.js 20 или новее.

Проверить версии можно так:

```bash
node -v
npm -v
```
Если после ввода node -v в КОМАНДНОЙ СТРОКЕ!!! ничего не произошло скачай node себе на ПК (ИНЕТ В ПОМОЩЬ)
## Запуск после копирования с GitHub

1. Склонируй проект:

```bash
git clone <ссылка-на-репозиторий>
cd notejeny
```

2. Установи зависимости:

```bash
npm install
```

На Windows PowerShell, если `npm` блокируется политикой выполнения скриптов, используйте:

```powershell
npm.cmd install
```

3. Создайте локальный `.env` файл:

```bash
cp .env.example .env
```

На Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

В `.env` должны быть такие значения:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
```

4. Сгенерируйте Prisma Client:

```bash
npm run db:generate
```

На Windows PowerShell:

```powershell
npm.cmd run db:generate
```

5. Создайте локальную SQLite-базу и таблицы:

```bash
npm run db:init
```

На Windows PowerShell:

```powershell
npm.cmd run db:init
```

После этого база появится в файле:

```text
prisma/dev.db
```

6. Запустите dev-сервер:

```bash
npm run dev
```

На Windows PowerShell:

```powershell
npm.cmd run dev
```

7. Откройте сайт:

```text
http://localhost:3000
```

Или сразу страницу входа:

```text
http://localhost:3000/auth
```

## Полный набор команд для Windows PowerShell

```powershell
git clone <ссылка-на-репозиторий>
cd notejeny
npm.cmd install
Copy-Item .env.example .env
npm.cmd run db:generate
npm.cmd run db:init
npm.cmd run dev
```

Потом открыть:

```text
http://localhost:3000/auth
```

## Полезные команды


Генерация Prisma Client:

```bash
npm run db:generate
```

Создание или обновление локальной SQLite-базы:

```bash
npm run db:init
```

Запуск production-сборки:

```bash
npm run build
npm run preview
```

### Если выдает 401!!!

Обычно это старые cookies или старое состояние dev-сервера.

Попробуйте:

1. Остановить сервер через `Ctrl + C`.
2. Очистить cookies для `localhost`.
3. Запустить снова:

```powershell
npm.cmd run dev
```



### После изменения Prisma-схемы база не обновилась

Запустите:

```powershell
npm.cmd run db:generate
npm.cmd run db:init
```

