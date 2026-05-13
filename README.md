# Умные Заметки

Nuxt 3 приложение для личных заметок с регистрацией, входом, категориями, закреплением и напоминаниями.

## Стек

- Nuxt 3 + TypeScript
- Tailwind CSS
- Nuxt Server Routes
- Prisma ORM
- SQLite для локальной базы данных
- JWT auth через httpOnly cookies

## Возможности

- Регистрация и вход
- Защищенный `/dashboard`
- Создание, редактирование и удаление заметок
- Цветные категории: работа, идеи, личное, срочно
- Закрепление заметок
- Поиск по заголовку и тексту
- Напоминания
- Блок ближайших напоминаний

## Что нужно установить

Перед запуском нужен Node.js. Рекомендуется Node.js 20 или новее.

Проверить версии можно так:

```bash
node -v
npm -v
```

## Запуск после копирования с GitHub

1. Склонируйте проект:

```bash
git clone <ссылка-на-репозиторий>
cd notejeny
```

2. Установите зависимости:

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

Для локального запуска можно оставить как есть, но лучше заменить `JWT_SECRET` на любую длинную случайную строку.

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

Проверка TypeScript:

```bash
npm run typecheck
```

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

## Частые проблемы

### PowerShell не запускает `npm` или `npx`

Если видите ошибку про execution policy, используйте команды с `.cmd`:

```powershell
npm.cmd run dev
npx.cmd prisma validate
```

### Ошибка 401 на `/api/notes`

Это значит, что вы не вошли в аккаунт или браузер не отправил auth-cookie.

Что сделать:

- откройте `http://localhost:3000/auth`;
- войдите или зарегистрируйтесь;
- используйте один и тот же адрес: либо всегда `localhost`, либо всегда `127.0.0.1`.

Лучше использовать:

```text
http://localhost:3000
```

Если проблема осталась, очистите cookies для `localhost` или откройте сайт в режиме инкогнито.

### Слишком много перенаправлений

Обычно это старые cookies или старое состояние dev-сервера.

Попробуйте:

1. Остановить сервер через `Ctrl + C`.
2. Очистить cookies для `localhost`.
3. Запустить снова:

```powershell
npm.cmd run dev
```

4. Открыть:

```text
http://localhost:3000/auth
```

### После изменения Prisma-схемы база не обновилась

Запустите:

```powershell
npm.cmd run db:generate
npm.cmd run db:init
```

## Структура проекта

- `components/` - интерфейсные компоненты
- `composables/` - клиентская логика auth и notes
- `middleware/` - защита маршрутов
- `pages/` - страницы `/auth` и `/dashboard`
- `server/api/` - API авторизации и заметок
- `server/utils/` - Prisma, JWT и validation helpers
- `prisma/schema.prisma` - модели `User` и `Note`
- `scripts/init-db.mjs` - создание SQLite-таблиц
- `assets/css/main.css` - Tailwind styles и анимации
