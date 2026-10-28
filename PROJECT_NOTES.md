# PROJECT NOTES — Эволюция Внешности: Сигма Кликер (Looksmaxxing Clicker)

Этот файл содержит полную шпаргалку по архитектуре, модулям, функциям, ассетам и пользовательским правилам дизайна проекта для быстрой навигации и доработок.

---

## 1. Структура проекта и файлов

### Основные модули (`src/modules/`)
1. **`src/modules/mechanics.ts`** — Ядро игровой математики, баланса и данных:
   - **`PSL_RANKS` (10 стадий эволюции)**:
     - Стадия 1 (`sub5` — Sub-5 Изгой, `0 PSL`)
     - Стадия 2 (`ltb` — LTB Нормис, `350 PSL`)
     - Стадия 3 (`mtb` — MTB Мьюер, `3 200 PSL`)
     - Стадия 4 (`htb` — HTB Скуловой, `25 000 PSL`)
     - Стадия 5 (`chadlite_low` — Ранняя стадия Chadlite, `180 000 PSL`)
     - Стадия 6 (`chadlite` — Chadlite, `1 200 000 PSL` — **порог открытия Реборна / Смены Поколения**)
     - Стадия 7 (`chad` — Архитектор Челюсти Chad, `9 500 000 PSL`)
     - Стадия 8 (`gigachad` — GigaChad Монолит, `75 000 000 PSL`)
     - Стадия 9 (`terachad` — TeraChad Божество, `650 000 000 PSL`)
     - Стадия 10 (`adam` — True Adam Абсолют, `6 000 000 000 PSL`)
   - **`UPGRADES` (16 предметов прокачки)** в 3 категориях:
     - `base` (База и Уход): Ледяной душ, Скребок Гуаша, Тейпирование рта, Миноксидил и Дермароллер, Шелковая наволочка.
     - `jaw` (Челюсть и Мьюинг): Жесткая жвачка Falim, Эспандер челюсти Chisell, Жевательная резинка Мастика, Протокол Хард-Мьюинга, Гипертрофия жевательных мышц, Выдвижение максиллы.
     - `bone` (Костная структура и Аура): Тренировка шеи с весом, Позитивный кантальный наклон, Leanmaxxing (сушка до 8% жира), Сигма-походка и осанка, Костная трансформация (Абсолют).
   - **`DNA_PERKS` (5 перманентных генов ДНК, макс. уровень 10)**:
     - `hunter_eyes` («Глаза Охотника») — +20% к силе клика за ур.
     - `hollow_cheeks` («Впалые Щеки») — +25% к авто-доходу в сек за ур.
     - `golden_ratio` («Золотое Сечение») — -4% к стоимости апгрейдов за ур.
     - `fast_metabolism` («Генетика Метаболизма») — +2% к шансу крита за ур.
     - `dominant_aura` («Доминантная Аура») — +0.4x к множителю крита за ур.
   - **`QUESTS` и `ACHIEVEMENTS`**: Задания и достижения с наградами в Очках Внешности (PSL) и очках ДНК.
   - **Ключевые функции расчета**:
     - `computePlayerStats(profile, activeEventMultiplier, isAdBoostActive, isMewingOverdriveActive)` — вычисляет `looksPerClick`, `looksPerSecond`, `critChance`, `critMultiplier`, `discountFactor`, `currentRank`, `nextRank`, `rankProgress`, `canRebirth`, `pendingRebirthDNA`, `generationMultiplier`.
     - `calculateUpgradeCost(upgrade, currentQty, discountFactor)` — стоимость одиночной покупки апгрейда.
     - `calculateBulkUpgradeCost(upgrade, currentQty, count, discountFactor, availableLooks)` — пакетная покупка (`1x`, `10x`, `MAX`).
     - `calculatePerkDnaCost(perk, currentLevel)` — цена прокачки гена ДНК.
     - `calculateRebirthDNA(currentRunTotalLooks)` — расчет начисляемых очков ДНК при Перерождении.

2. **`src/modules/profile.ts`** — Состояние игрока, сохранения и Облако Яндекс Игр:
   - `PlayerProfileData` — интерфейс сохранения игрока (`looks`, `currentRunTotalLooks`, `lifetimeTotalLooks`, `totalClicks`, `criticalClicks`, `generation`, `dnaPoints`, `upgradeCounts`, `perkLevels`, `claimedQuests`, `unlockedAchievements`, `soundEnabled`, `buyMultiplier`, `lastSaveTimestamp`).
   - `initYandexStorage()` / `saveProfileData(profile, forceCloud)` — гибридное сохранение в `localStorage` + Yandex Games SDK (`player.setData` / `setStats`).
   - `calculateOfflineEarnings(profile, looksPerSecond)` — расчет оффлайн-прогресса (до 8 часов, 50% эффективности, с возможностью удвоения `×2` за рекламу).
   - `getLeaderboardEntries(profile)` — таблица лидеров PSL.

3. **`src/modules/renderer.ts`** — Аудио-синтезатор (Web Audio API) и Canvas 2D:
   - `SoundEngine`:
     - `playTap(isCrit)` — звук клика / крита.
     - `playBuy()` — звук покупки улучшения.
     - `playRankUp()` — фанфары новой стадии PSL.
     - `playSigmaOverdrive()` — аккорд активации Sigma Overdrive (`×2`).
     - `playQuestClaim()` — звук получения награды.
   - `drawStageAvatar(ctx, width, height, rankIndex, pulsePhase, clickScale, isMewingOverdrive)` — отрисовка 2D-портрета на Canvas (используется во вспомогательных миниатюрах `RankPortraitThumb`).

4. **`src/modules/musicPlayer.ts`** — Phonk / Hardstyle радио и аудио-эффекты:
   - Плейлист треков (`PHONK_PLAYLIST`), переключение треков, громкость, Phonk-синт генератор и голосовая озвучка эволюции (`playAscensionVoiceAndChord`).

5. **`src/modules/utils.ts`** — Утилиты форматирования:
   - `formatLooks(value)` — форматирование больших чисел (`K`, `M`, `B`, `T`, `Qa`).
   - `formatDuration(seconds)` — форматирование таймеров (`ММ:СС`).
   - `clamp(val, min, max)`, `uid()`.

---

## 2. Компоненты интерфейса (`src/components/` и `src/App.tsx`)

1. **`src/App.tsx`** — Главный контроллер приложения:
   - Управляет вкладками (`activeSection`: `'arena' | 'evolution' | 'rebirth' | 'quests' | 'leaderboard'`).
   - Держит игровой цикл (`requestAnimationFrame` для пассивного дохода в секунду, комбо-шкалы Mewing Streak и спавна Золотых Гуаша).
   - **Важное правило слоев (`z-index`) и фонов**:
     - `{activeSection === 'arena' && <ArenaStageBackground ... />}` — живой фон арены и желтое свечение Sigma Overdrive рендерятся **ТОЛЬКО** на вкладке «Арена Прокачки».
     - `{activeSection === 'rebirth' && <RebirthStarryBackground />}` — звездное небо с парящими фото Адамов рендерится **ТОЛЬКО** на вкладке «Поколения и ДНК» на верхнем уровне `App.tsx` (до `<header>`).
     - Шапка `<header>` и нижняя мобильная навигация имеют `relative z-30` и плотный темный фон, чтобы все вкладки всегда были идеально читаемыми.

2. **`src/components/ArenaStageBackground.tsx`** — Фон вкладки «Арена Прокачки»:
   - Принимает `stageIndex`, `clickPulse`, `critPulse`, `isOverdrive`.
   - Загружает атмосферные фоны `/assets/arenas/arena_1.jpg` ... `arena_10.jpg` под каждую из 10 стадий PSL.
   - Реализует эффект вспышки при нажатии (`clickPulse`), ударной волны при крите (`critPulse`) и золотого пламени в режиме Sigma Overdrive (`isOverdrive`), **без каких-либо квадратных артефактов/сеток**.

3. **`src/components/ModalsAndPanels.tsx`** — Все остальные вкладки и модальные окна:
   - `OfflineEarningsModal` — модалка оффлайн-дохода с кнопкой `×2 за рекламу`.
   - `RankAscensionModal` — полноэкранное поздравление при переходе на новый ранг PSL.
   - `EvolutionTreeView` — вкладка «Древо Эволюции» (10 стадий от Sub-5 до True Adam).
   - `RebirthStarryBackground` — космический фон вкладки «Поколения и ДНК» (`/assets/adams/nebula_1.jpg` на 100% яркости + 6 плавно парящих в невесомости фотографий Адамов без надписей и без затухания).
   - `GeneticsRebirthView` — вкладка «Поколения и ДНК»:
     - Верхний компактный баннер Реборна с 3D-спиралью ДНК (`/assets/perks/dna_helix.gif`), прогрессом до Chadlite и кнопкой `⚡ ПЕРЕРОДИТЬСЯ`.
     - Полноэкранная вспышка смены поколения (`rebirthFlash`) с ударными волнами при клике на реборн.
     - Сетка из 5 GIF-карточек мутаций ДНК с минимумом текста (только короткое название, бонус и кнопка покупки) и **золотой эволюцией (`★ АБСОЛЮТ ✓`)** при достижении `10/10`.
   - `QuestsAndAchievementsView` — вкладка «Задания и Достижения».
   - `LeaderboardAndBalanceView` — вкладка «Рейтинг PSL».

4. **`src/components/LooksmaxMusicPlayer.tsx`** — Встроенный плеер Phonk-радио в шапке.
5. **`src/components/UpgradeSketchArt.tsx`** — Иконки/скетчи для 16 апгрейдов в магазине.
6. **`src/components/LooksmaxLoadingScreen.tsx`** — Загрузочный экран при старте игры.

---

## 3. Карта графических ассетов (`public/assets/`)

- **Портреты 10 рангов PSL (`public/assets/ranks/`)**:
  - `rank_1.jpg` ... `rank_10.jpg`
- **Фоны Арены Прокачки (`public/assets/arenas/`)**:
  - `arena_1.jpg` ... `arena_10.jpg`
- **Космос и портреты Адамов для вкладки «Поколения и ДНК» (`public/assets/adams/`)**:
  - `nebula_1.jpg` — яркое звездное небо и туманность
  - `sean_opry_2.jpg` — Шон О’Прай (верхний левый угол)
  - `david_gandy_2.jpg` — Дэвид Ганди (верхний правый угол)
  - `alain_delon.jpg` — Ален Делон (нижний левый угол)
  - `christian_bale.jpg` — Кристиан Бейл в прайме / Патрик Бейтман (крайний правый нижний угол)
  - `david_gandy_1.jpg` — Дэвид Ганди (нижний центр-лево)
- **Анимированные GIF для перков ДНК (`public/assets/perks/`)**:
  - `dna_helix.gif` — 3D-спираль ДНК
  - `david_laid.gif` — Дэвид Лейд (метаболизм + фон ДНК)
  - `jawline_check.gif` — скулы и челюсть
  - `handsome_squidward.gif` — золотое сечение

---

## 4. Зафиксированные предпочтения пользователя (UX / Визуал)

1. **Никаких квадратов при клике на Арене**: только чистый световой импульс и круглая ударная волна при крите.
2. **Изоляция эффектов по вкладкам**:
   - Желтое свечение Sigma Overdrive и фон арены отображаются **только** на вкладке «Арена Прокачки».
   - Звездное небо и парящие фото Адамов отображаются **только** на вкладке «Поколения и ДНК».
3. **Вкладка «Поколения и ДНК»**:
   - Фон и фотографии Адамов яркие (`opacity-100`, без темной пелены и без текстовых подписей поверх фото).
   - Никакого нижнего блока выбора фотографий («Созвездие Эстетики» убрано).
   - В карточках ДНК минимум текста: без имен персонажей и без правых подзаголовков на гифках.
   - Навигационные вкладки сверху всегда четко видны (`z-30`).
4. **Вкладка «Эволюция PSL (8 стадий)» (`EvolutionAtlasView`)**:
   - Минимум текста на карточках (только номер `#1..#8`, множитель `×M`, портрет, название ранга и компактный статус).
   - Кнопка `Смотреть бой Олимпа / Показать карточки` (`watchBattleMode`) в верхней панели для полноэкранного просмотра битвы без карточек.
   - На заднем фоне — **фотореалистичный авто-бой двух загруженных пользователем мраморных греческих статуй** (`/assets/aistudio/____________b9e4bfd1.png` — Аполлон и `/assets/aistudio/9bd41ccd057c3b10554b073c332fe5cd_cca3f73a.jpg` — Зевс) на фоне вершины Олимпа (`/assets/backgrounds/stage4_olympus.jpg`).
   - **Никаких мультяшных/рисованных конечностей или линий**: обе фотографии очищаются от темного студийного фона с сохранением 100% оригинальных фотографических рук, кулаков, вен, пресса, лиц и ног (`preparePhotorealisticStatueCanvas`), приводятся к единому тону теплого слонового мрамора и оживляются через **2D UV-сетку из 280 текстурированных треугольников (Puppet-Pin деформация в `drawPuppetWarpedStatue`)**, благодаря чему двигаются сами реальные фотографии скульптур со вспышками ударов и разлетом мраморной пыли/осколков.


