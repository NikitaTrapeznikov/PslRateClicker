# PROJECT NOTES — PSL Ascension: Эволюция Внешности

Актуальная карта модульной архитектуры проекта (все файлы разбиты на компактные модули до 450–900 строк, каждый помещается в 1 быстрый вызов `view_file` без повторных чтений).

---

## 1. Карта файлов и компонентов (куда сразу идти при правках)

### Главный контроллер и Арена (`src/App.tsx` — ~1320 строк)
- Управляет состоянием профиля (`profile`), 4 основными вкладками (`activeSection`: `'arena' | 'evolution' | 'rebirth' | 'leaderboard'`), комбо мьюинга (`mewingCombo`), импульсом ауры (`auraFrenzyRemainingSec`) и бонус-мишенями на стекле зеркала (`mirrorTarget`).
- Содержит верхнюю панель навигации (`<header className="relative z-30 ...">`), баннеры оффлайн-дохода/повышения ранга и центральную колонку **Умного Зеркала (Smart Mirror)** с HTML5 Canvas (`PSLSpriteRenderer`).
- Изолирует фоны по вкладкам:
  - `{activeSection === 'arena' && <ArenaStageBackground ... />}` + неоновая виньетка «Поток Сигмы».
  - `{activeSection === 'rebirth' && <RebirthStarryBackground />}` — звёздное небо с парящими фото Адамов.

### Отдельные компоненты экранов и виджетов (`src/components/`)
1. **`src/components/MarketplacePhoneShop.tsx` (~490 строк)** — Правая колонка Арены:
   - 3D-смартфон **Cosmic Orange 17 Pro** с разворотом на `180deg` (`isShopMinimized`).
   - Лицевая сторона: экран маркетплейса с переключением витрин **«О-ЗОНА · Клик»** (`#005BFF` / `#F91155`) и **«ЯГОДКИ · Уход»** (`#CB11AB` / `#F472B6`), режимами `×1 / ×10 / MAX`, подсветкой лучшего ROI (`bestRoiItemId`) и шкалой до рубежа `×2`.
   - Задняя крышка: полноширинное плато из 3 объективов Pro + True Tone Flash + LiDAR, кольцо MagSafe и MagSafe Wallet быстрого заказа.
2. **`src/components/EvolutionAtlasView.tsx` (~250 строк)** — Вкладка **«Эволюция PSL (8 стадий)»**:
   - Компактная верхняя панель с текущим/выбранным портретом, точками быстрого выбора стадий `#1..#8`, прогрессом до следующей стадии и кнопкой `Смотреть бой Олимпа / Показать карточки` (`watchBattleMode`).
   - Сетка из 8 полупрозрачных карточек рангов (`Sub 3` .. `True Adam`) с портретами `RankPortraitThumb`.
3. **`src/components/OlympusTitansBattleBackdrop.tsx` (~450 строк)** — Фоновый 2D-движок вкладки Эволюции:
   - Фотореалистичный авто-бой двух греческих статуй (`/assets/aistudio/____________b9e4bfd1.png` — Аполлон слева и `/assets/aistudio/9bd41ccd057c3b10554b073c332fe5cd_cca3f73a.jpg` — Зевс справа) на фоне `/assets/backgrounds/stage4_olympus.jpg`.
   - Использует `preparePhotorealisticStatueCanvas` (точная студийная обтравка с сохранением 100% оригинальных рук, ног, пресса и лиц) и `drawPuppetWarpedStatue` (2D UV сетка `10×14` треугольников Puppet-Pin без мультяшных примитивов).
4. **`src/components/GeneticsRebirthView.tsx` (~345 строк)** — Вкладка **«Поколения и ДНК»**:
   - Экспортирует `RebirthStarryBackground` (яркий космос `/assets/adams/nebula_1.jpg` + 6 парящих фото Адамов без затухания) и `GeneticsRebirthView`.
   - Верхний компактный баннер Смены Поколения с 3D-спиралью ДНК (`/assets/perks/dna_helix.gif`), прогрессом до `Chadlite` (`15 000 000 PSL`), кнопкой `⚡ ПЕРЕРОДИТЬСЯ` и полноэкранной вспышкой вознесения (`rebirthFlash`).
   - Сетка из 5 GIF-карточек мутаций ДНК (`DNA_PERKS`) с золотой эволюцией `animate-gold-gene` (`★ АБСОЛЮТ ✓`) при достижении максимального уровня.
5. **`src/components/LeaderboardAndBalanceView.tsx` (~190 строк)** — Вкладка **«Рейтинг и Баланс»**:
   - Таблица лидеров Яндекс Игр (`leaderboard`), синхронизация с облаком, статистика профиля (`sdkMode`), кнопки тестирования оффлайн-баланса (`+30 мин`, `+2 часа`, `+8ч (Сон)`) и двухшаговый сброс прогресса.
6. **`src/components/ModalsAndPanels.tsx` (~20 строк)** — Компактный фасад реэкспорта `EvolutionAtlasView`, `GeneticsRebirthView`, `RebirthStarryBackground`, `LeaderboardAndBalanceView`, `OlympusTitansBattleBackdrop`.
7. **`src/components/LooksmaxMusicPlayer.tsx` (~350 строк)** — Левая колонка Арены:
   - В свёрнутом виде (`isMinimized = true`): карточка `320×420` с мгновенным переключением 5 предзагруженных GIF танцоров по клику и мини-пульт поверх.
   - В развёрнутом виде: полный список из 16 MP3-треков, режимы `0.85x Slowed`, `Повтор 1 / Подряд`, кроссфейд 4с.
8. **`src/components/LooksmaxLoadingScreen.tsx` (~420 строк)** — Экран загрузки с мем-слайдером, чеклистом модулей и кнопкой `SKIP · ПРОПУСТИТЬ`.
9. **`src/components/ArenaStageBackground.tsx` (~125 строк)** — Сменяемый фон Арены (4 локации: Ночная Комната, Aesthetics Gym, Пентхаус Сигмы, Золотой Олимп).
10. **`src/components/RankPortraitThumb.tsx` (~65 строк)** — Canvas-миниатюра портрета стадии PSL из атласа.
11. **`src/components/UpgradeSketchArt.tsx` (~328 строк)** — Ч/б векторные скетч-иллюстрации для всех 14 товаров магазина.

---

## 2. Ядро логики и движки (`src/modules/`)

1. **`src/modules/mechanics.ts` (~705 строк)**:
   - `PSL_RANKS` (8 канонических стадий: `Sub 3`, `Sub 5`, `LTN`, `MTN`, `HTN`, `Chadlite`, `Chad`, `True Adam`).
   - `SHOP_ITEMS` (14 предметов: 6 в категории `'click'` и 8 в категории `'passive'`).
   - `DNA_PERKS` (5 перков ДНК: `hunter_eyes`, `hollow_cheeks`, `gonial_angle`, `forward_maxilla`, `adams_lineage`).
   - `computePlayerStats`, `calculateItemCost`, `calculateMaxAffordable`, `calculatePerkDnaCost`, `RANK_LED_PALETTES`.
2. **`src/modules/renderer.ts` (~940 строк)**:
   - `PSLSpriteRenderer` — рендерер центрального портрета в Умном Зеркале (`/assets/aistudio/image_998de055_hd.png`), 36-полосная биомеханическая анимация мьюинга при `mewingCombo > 0`, удар молотка, круговые ударные волны и всплывающие цифры.
   - `drawRankThumbnailOnCanvas` — отрисовка миниатюр рангов.
3. **`src/modules/musicPlayer.ts` (~860 строк)**:
   - `looksmaxMusic` (`DualDeckCrossfadeController`) — двухдековый MP3-плеер (`Deck A + Deck B`) с Blob-кэшированием в ОЗУ, авто-кроссфейдом 4с и жёсткой привязкой к главному экрану (`setMainScreenActive`).
4. **`src/modules/profile.ts` (~480 строк)**:
   - `profileManager` (`AsyncProfileManager`) — интеграция YaGames SDK v2, гибридное сохранение (`localStorage` + облако) с контрольной суммой FNV-1a, расчёт оффлайн-дохода до 12 часов и показ Rewarded-рекламы.
5. **`src/modules/utils.ts` (~314 строк)**:
   - `formatLooks`, `formatDuration`, `computeSaveChecksum`, процедурный Web Audio синтезатор `soundEngine` и системные хуки Яндекс Игр `installYandexGamesPlatformGuards`.
