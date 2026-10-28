import React from 'react';

export interface GirlContactProfile {
  id: string;
  name: string;
  handle: string;
  minRankIndex: number;
  avatarBg: string;
  hairColor: string;
  accentColor: string;
  isPremium?: boolean;
  bioTag: string;
}

export type MessageTone = 'negative' | 'neutral' | 'admiring';

export interface MessengerDialogItem {
  girl: GirlContactProfile;
  lastMessage: string;
  timeLabel: string;
  unreadCount: number;
  isTyping: boolean;
  isNegative: boolean;
  tone: MessageTone;
  updatedAt: number;
}

/**
 * 22 девушки, которые начинают писать игроку по мере роста его уровня PSL (от Sub 3 до True Adam).
 * Чем выше ранг игрока, тем больше девушек появляется в списке диалогов.
 */
export const GIRL_CONTACTS: GirlContactProfile[] = [
  // Уровень 0 (Sub 3) — 3 базовых контакта
  {
    id: 'girl_nastya',
    name: 'Настя',
    handle: '@nastya_k',
    minRankIndex: 0,
    avatarBg: 'from-pink-500 to-rose-600',
    hairColor: '#3B2314',
    accentColor: '#F43F5E',
    bioTag: 'Однокурсница',
  },
  {
    id: 'girl_alina',
    name: 'Алина',
    handle: '@alina_vibe',
    minRankIndex: 0,
    avatarBg: 'from-purple-500 to-indigo-600',
    hairColor: '#F59E0B',
    accentColor: '#A855F7',
    bioTag: 'Соседка по району',
  },
  {
    id: 'girl_katya',
    name: 'Катя',
    handle: '@katya_meow',
    minRankIndex: 0,
    avatarBg: 'from-sky-500 to-blue-600',
    hairColor: '#1E1B18',
    accentColor: '#38BDF8',
    bioTag: 'Из кофейни',
  },

  // Уровень 1 (Sub 5) — +2 девушки (всего 5)
  {
    id: 'girl_daria',
    name: 'Даша',
    handle: '@daria_fit',
    minRankIndex: 1,
    avatarBg: 'from-emerald-500 to-teal-600',
    hairColor: '#78350F',
    accentColor: '#10B981',
    bioTag: 'Фитнес-клуб',
  },
  {
    id: 'girl_vika',
    name: 'Вика',
    handle: '@vika_lux',
    minRankIndex: 1,
    avatarBg: 'from-amber-500 to-orange-600',
    hairColor: '#FDE047',
    accentColor: '#F59E0B',
    bioTag: 'Бьюти-мастер',
  },

  // Уровень 2 (LTN) — +2 девушки (всего 7)
  {
    id: 'girl_polina',
    name: 'Полина',
    handle: '@polly_art',
    minRankIndex: 2,
    avatarBg: 'from-fuchsia-500 to-pink-600',
    hairColor: '#451A03',
    accentColor: '#E879F9',
    bioTag: 'Дизайнер',
  },
  {
    id: 'girl_sonya',
    name: 'Соня',
    handle: '@sonya_sweet',
    minRankIndex: 2,
    avatarBg: 'from-cyan-500 to-sky-600',
    hairColor: '#FACC15',
    accentColor: '#22D3EE',
    bioTag: 'Фотограф',
  },

  // Уровень 3 (MTN) — +3 девушки (всего 10, средний уровень — смесь реакций)
  {
    id: 'girl_milana',
    name: 'Милана ✨',
    handle: '@milana_star',
    minRankIndex: 3,
    avatarBg: 'from-rose-500 to-red-600',
    hairColor: '#1C1917',
    accentColor: '#FB7185',
    isPremium: true,
    bioTag: 'Модель агентства',
  },
  {
    id: 'girl_lerochka',
    name: 'Лера',
    handle: '@lera_muse',
    minRankIndex: 3,
    avatarBg: 'from-violet-500 to-purple-600',
    hairColor: '#9A3412',
    accentColor: '#C084FC',
    bioTag: 'Танцовщица',
  },
  {
    id: 'girl_kristina',
    name: 'Кристина',
    handle: '@kris_velvet',
    minRankIndex: 3,
    avatarBg: 'from-blue-500 to-indigo-600',
    hairColor: '#FEF08A',
    accentColor: '#60A5FA',
    isPremium: true,
    bioTag: 'Стилист',
  },

  // Уровень 4 (HTN) — +3 девушки (всего 13)
  {
    id: 'girl_eva',
    name: 'Ева 💎',
    handle: '@eva_aesthetic',
    minRankIndex: 4,
    avatarBg: 'from-pink-500 to-fuchsia-600',
    hairColor: '#18181B',
    accentColor: '#F472B6',
    isPremium: true,
    bioTag: 'Топ-блогер',
  },
  {
    id: 'girl_diana',
    name: 'Диана',
    handle: '@diana_grace',
    minRankIndex: 4,
    avatarBg: 'from-teal-500 to-emerald-600',
    hairColor: '#57534E',
    accentColor: '#2DD4BF',
    bioTag: 'Актриса',
  },
  {
    id: 'girl_veronika',
    name: 'Вероника 🔥',
    handle: '@nika_flame',
    minRankIndex: 4,
    avatarBg: 'from-orange-500 to-rose-600',
    hairColor: '#7C2D12',
    accentColor: '#FB923C',
    isPremium: true,
    bioTag: 'Фэшн-редактор',
  },

  // Уровень 5 (Chadlite) — +3 девушки (всего 16)
  {
    id: 'girl_kamilla',
    name: 'Камилла 👑',
    handle: '@kamilla_vip',
    minRankIndex: 5,
    avatarBg: 'from-amber-400 to-rose-600',
    hairColor: '#0F172A',
    accentColor: '#FBBF24',
    isPremium: true,
    bioTag: 'Супермодель',
  },
  {
    id: 'girl_arina',
    name: 'Арина',
    handle: '@arina_silk',
    minRankIndex: 5,
    avatarBg: 'from-indigo-500 to-blue-700',
    hairColor: '#FDE68A',
    accentColor: '#818CF8',
    isPremium: true,
    bioTag: 'Балерина',
  },
  {
    id: 'girl_zlata',
    name: 'Злата ✨',
    handle: '@zlata_gold',
    minRankIndex: 5,
    avatarBg: 'from-yellow-500 to-amber-600',
    hairColor: '#F59E0B',
    accentColor: '#FACC15',
    isPremium: true,
    bioTag: 'Подиум Милан',
  },

  // Уровень 6 (Chad) — +3 девушки (всего 19)
  {
    id: 'girl_adelina',
    name: 'Аделина 💖',
    handle: '@adelina_paris',
    minRankIndex: 6,
    avatarBg: 'from-rose-500 to-pink-700',
    hairColor: '#1E293B',
    accentColor: '#F43F5E',
    isPremium: true,
    bioTag: 'Лицо обложки Vogue',
  },
  {
    id: 'girl_stefania',
    name: 'Стефания 💎',
    handle: '@stefi_prime',
    minRankIndex: 6,
    avatarBg: 'from-sky-400 to-indigo-600',
    hairColor: '#FEF9C3',
    accentColor: '#38BDF8',
    isPremium: true,
    bioTag: 'Кинозвезда',
  },
  {
    id: 'girl_yasmina',
    name: 'Ясмина 🔥',
    handle: '@yasmina_lux',
    minRankIndex: 6,
    avatarBg: 'from-purple-600 to-rose-600',
    hairColor: '#09090B',
    accentColor: '#E879F9',
    isPremium: true,
    bioTag: 'Мисс Вселенная',
  },

  // Уровень 7 (True Adam) — +3 девушки (всего 22)
  {
    id: 'girl_bella',
    name: 'Белла 👑',
    handle: '@bella_divine',
    minRankIndex: 7,
    avatarBg: 'from-amber-300 via-yellow-500 to-orange-600',
    hairColor: '#171717',
    accentColor: '#FDE047',
    isPremium: true,
    bioTag: 'Ангел подиума',
  },
  {
    id: 'girl_avrora',
    name: 'Аврора ✨',
    handle: '@aurora_celeste',
    minRankIndex: 7,
    avatarBg: 'from-emerald-400 to-cyan-600',
    hairColor: '#FFFBEB',
    accentColor: '#34D399',
    isPremium: true,
    bioTag: 'Муза Олимпа',
  },
  {
    id: 'girl_serafima',
    name: 'Серафима 💫',
    handle: '@serafima_royal',
    minRankIndex: 7,
    avatarBg: 'from-fuchsia-400 via-rose-500 to-amber-500',
    hairColor: '#27272A',
    accentColor: '#FB7185',
    isPremium: true,
    bioTag: 'Икона эстетики',
  },
];

/**
 * Ровно 50 простых фраз с негативными реакциями (основные на Sub 3 и Sub 5, иногда встречаются на средних).
 */
export const NEGATIVE_GIRL_PHRASES: string[] = [
  'Извини, но ты вообще не в моём вкусе...',
  'Не пиши мне больше, пожалуйста',
  'Ты мне максимум как друг, без обид',
  'Фу, зачем ты скинул селфи снизу вверх?',
  'У меня телефон лагает от твоих сообщений, пока',
  'Слушай, давай просто сделаем вид, что мы не знакомы',
  'Почему ты всегда дышишь ртом на фотках?',
  'Сорри, я сегодня занята. И завтра. И весь год',
  'Мой парень в зале жмёт 140, не пиши сюда',
  'Тебе бы хотя бы выспаться и умыться для начала...',
  'Ой, я случайно лайкнула, не обольщайся',
  'Кто дал тебе мой контакт? Удаляю диалог',
  'Нет, я не пойду с тобой пить кофе',
  'У тебя такой грустный взгляд, мне аж не по себе',
  'Прости, я встречаюсь только с высокими и скуластыми',
  'Чел, перестань спамить мне огонёчками на сторис',
  'Мы из разных вселенных, забудь',
  'Даже не пытайся, шансов ноль',
  'Ты серьёзно думал, что я отвечу «да»?',
  'Сначала приведи себя в порядок, потом пиши',
  'Извини, у меня аллергия на слабый подбородок',
  'Я же сказала — мы просто одногруппники, не больше',
  'Хватит смотреть на меня в коридоре, это кринж',
  'Подруги засмеют, если увидят нас вместе',
  'Ты хороший парень, но химия вообще на нуле',
  'У тебя на аватарке фильтр или ты реально не спал неделю?',
  'Не звони мне, я сбросила специально',
  'Мне нравятся парни с чёткой линией челюсти, сори',
  'Давай без обид, но ты совсем не мой типаж',
  'Я занята, перебираю гречку',
  'Кажется, тебе пора заняться мьюингом, без негатива',
  'Почему у тебя такие отёки под глазами в 20 лет?',
  'Оставь меня в покое, я гуляю с другим',
  'Ты милый, как младший брат, но не как парень',
  'Скинь лучше конспект, а гулять я не пойду',
  'Мне нравятся уверенные сигмы, а ты сутулишься',
  'Это сообщение было прочитано и проигнорировано',
  'Ещё одно «привет, как дела» — и летишь в ЧС',
  'Нет, у меня нет времени на свидания с тобой',
  'Посмотри в зеркало, ну какая нам пара?',
  'Я думала, это курьер пишет, а это опять ты...',
  'Извини, меня ждёт парень на парковке',
  'Не дари мне цветы, мне неловко перед людьми',
  'Твоя причёска выглядит так, будто ты спал лицом в подушку',
  'Запишись хотя бы в зал, может поможет',
  'Удали мой номер, пожалуйста',
  'Никаких встреч, я же сразу дала понять',
  'Сорян, ты вообще не вывозишь по внешке',
  'Мне нравятся парни модельной внешности, увы',
  'Всё, пока, добавляю тебя в архив навсегда',
];

/**
 * Ровно 50 нейтральных, сдержанно-позитивных и слегка скептичных фраз для средних уровней (LTN, MTN, HTN).
 */
export const NEUTRAL_MIXED_GIRL_PHRASES: string[] = [
  'Привет, ну на новой фотке ты выглядишь уже получше, кстати',
  'Слушай, ты вроде изменился немного? Причёску сменил?',
  'Не знаю насчёт свидания, давай пока просто пообщаемся тут',
  'В целом норм выглядишь, но над стилем ещё стоит поработать',
  'А ты в зал начал ходить? Вроде плечи шире стали',
  'На прошлой неделе я бы не ответила, но сейчас ты ничего так',
  'Привет! Если будет свободный вечер на выходных — спишемся',
  'Свет на селфи так себе, но черты лица стали чётче',
  'Ты обычный нормальный парень, просто не торопи события',
  'Подруга сказала, что ты симпатичный, а я пока присматриваюсь 🤔',
  'Ну кофе попить можно как-нибудь после пар, почему нет',
  'У тебя взгляд стал увереннее, мне это даже нравится',
  'Раньше ты сутулился, а сейчас осанка прям ровная, респект',
  'Не скажу, что я влюбилась, но ты определённо прогрессируешь',
  'Ого, отёки ушли! Начал высыпаться и пить воду?',
  'Ты сегодня неплохо выглядел, кстати, когда проходил мимо',
  'Если пригласишь в нормальное место, я подумаю 🙂',
  'Пока не обещаю ничего, у меня много дел на этой неделе',
  'Слушай, ну с этого ракурса профиль выглядит вполне достойно',
  'Ещё немного подкачаешься — и вообще красавчиком будешь',
  'Я заметила, ты стал следить за кожей, тебе идёт',
  'Ладно, беру свои слова обратно, ты не безнадёжен 😉',
  'Привет, скинь плейлист, с которым ты в зале тренируешься',
  'На пятницу у меня планы, но в воскресенье можем пересечься',
  'Ты вроде стал поспокойнее и увереннее в себе, это плюс',
  'Ну до модели ещё далеко, конечно, но уже приятный парень',
  'А чем ты пользуешься для укладки? Выглядит аккуратно',
  'Окей, один шанс на прогулку в парке у тебя есть',
  'Странно, раньше я тебя вообще не замечала в компании',
  'Хорошая куртка на сторис, тебе подходит этот стиль',
  'Давай без громких обещаний, просто посмотрим как пойдёт',
  'Ты мне симпатичен, но мне нужно время, чтобы узнать тебя',
  'Кстати, линия челюсти реально стала заметнее, мьюинг работает?',
  'Сегодня ты прям бодро выглядишь, так держать',
  'Неплохое фото, я даже лайк поставила, видел?',
  'Посмотрим, как ты проявишь себя при встрече вживую',
  'В принципе, с тобой приятно переписываться, не душнишь',
  'Улыбайся почаще на фотках, а то слишком серьёзный',
  'Если не опоздаешь — выпьем по латте завтра днём',
  'Ты точно что-то поменял во внешности, но не пойму что именно',
  'Из всех, кто мне сегодня писал, ты самый адекватный',
  'Нормальный лук, только кроссовки белые сюда лучше подойдут',
  'Я пока не ищу серьёзных отношений, но погулять можно',
  'Слушай, а ты вытянулся или мне показалось?',
  'Ладно, уговорил, скидывай геолокацию кофейни ☕',
  'Вживую ты выглядишь интереснее, чем на старых аватарках',
  'Приятно удивлена, ты сильно вырос над собой за последнее время',
  'Держи баланс: не будь слишком навязчивым, и всё будет ок',
  'Забавный мем скинул, настроение поднял 🙂',
  'Продолжай в том же духе, ты на правильном пути к топу',
];

/**
 * Ровно 50 простых фраз с восхищением (появляются в миксе на средних уровнях и доминируют на высоких).
 */
export const ADMIRING_GIRL_PHRASES: string[] = [
  'Привет! У тебя просто нереальные скулы 😍',
  'Ты случайно не модель? Не могу оторвать взгляд 🔥',
  'Гуляем сегодня вечером? Я сама за тобой заеду ❤️',
  'Твой профиль — это просто произведение искусства...',
  'Все мои подруги спрашивают, свободен ли ты 👀',
  'Откуда у тебя такая идеальная линия челюсти?!',
  'Твой взгляд просто гипнотизирует, мурашки по коже ✨',
  'Я видела тебя сегодня в зале, ты выглядел как бог Олимпа',
  'Можно я просто буду смотреть на твои фото вечно? 💖',
  'Ты самый красивый парень, которого я встречала в жизни',
  'Давай сходим куда-нибудь сегодня? Я всё отменила ради тебя',
  'Как вообще законно иметь такую симметрию лица?! 🔥',
  'Ты мне снился сегодня... когда увидимся?',
  'Твои глаза — это просто чистый магнетизм 😍',
  'Я стеснялась написать первой, но ты просто 10 из 10',
  'Скажи честно, тебя высекли из мрамора в Древней Греции?',
  'Любая фотография с тобой выглядит как обложка журнала ✨',
  'У тебя такая мощная аура, рядом с тобой сердце бьётся быстрее',
  'Я готова ждать сколько угодно, только напиши мне ❤️',
  'Твоя улыбка и скулы свели меня с ума с первой секунды',
  'Почему ты такой идеальный? Это вообще реально?',
  'Мой бывший даже рядом с твоей тенью не стоял 🔥',
  'Скинь ещё одно селфи, пожалуйста, ты невероятный',
  'Ты заходишь в комнату — и все смотрят только на тебя 👑',
  'Хочу провести с тобой все выходные, ты как?',
  'У тебя внешность главного героя голливудского кино',
  'Подруга сказала, что ты настоящий Chad, и она права на 100%',
  'Твой голос и твой взгляд — это запрещённый приём 💘',
  'Я бы пошла за тобой хоть на край света, честно',
  'Какая же у тебя благородная осанка и точёное лицо!',
  'Мне кажется, в тебя невозможно не влюбиться с первого взгляда',
  'Ты выглядишь лучше любого актёра с красной дорожки ✨',
  'Можно пригласить тебя на ужин? Я угощаю 😊',
  'Твои скулы острее, чем мои планы на жизнь 🔥',
  'Я пересматриваю твои сторис уже десятый раз подряд',
  'Рядом с тобой все остальные парни просто невидимки',
  'У тебя генетика просто космического уровня 💎',
  'Когда ты посмотрел в мою сторону, я забыла как дышать',
  'Напиши, когда освободишься, я приеду за 10 минут ❤️',
  'Ты эталон мужской красоты, без единого изъяна',
  'Даже без фильтров и света ты выглядишь безупречно',
  'Наше фото вместе набрало бы миллион лайков за час ✨',
  'Твои черты лица — чистое золотое сечение 👑',
  'Я отшила троих парней на этой неделе, потому что думаю о тебе',
  'С тобой хоть в спортзал, хоть в Париж — я согласна на всё',
  'Твой прищур Hunter Eyes разбивает мне сердце 💔🔥',
  'Скажи, что ты сегодня свободен, умоляю!',
  'Ты буквально ожившая статуя Аполлона 😍',
  'Каждая деталь твоего лица совершенна, я в восторге',
  'Ты настоящий True Adam, таких как ты один на миллиард 👑💖',
];

/**
 * Выбирает тон сообщения в зависимости от уровня игрока:
 * - На низких уровнях (Sub 3, Sub 5): негативные реакции (с редкими нейтральными).
 * - На средних уровнях (LTN, MTN, HTN): живая смесь негативных, нейтральных/средних и восхищённых реакций.
 * - На высоких уровнях (Chadlite, Chad, True Adam): восхищение и комплименты.
 */
export function rollMessageToneForRank(rankIndex: number): MessageTone {
  const r = Math.random();
  if (rankIndex <= 0) {
    // Sub 3: 92% негатив, 8% нейтрал
    return r < 0.92 ? 'negative' : 'neutral';
  }
  if (rankIndex === 1) {
    // Sub 5: 80% негатив, 20% нейтрал
    return r < 0.8 ? 'negative' : 'neutral';
  }
  if (rankIndex === 2) {
    // LTN (начало средних): 45% негатив, 40% нейтрал, 15% восхищение
    if (r < 0.45) return 'negative';
    if (r < 0.85) return 'neutral';
    return 'admiring';
  }
  if (rankIndex === 3) {
    // MTN (средний уровень): 28% негатив, 44% нейтрал/средние, 28% восхищение
    if (r < 0.28) return 'negative';
    if (r < 0.72) return 'neutral';
    return 'admiring';
  }
  if (rankIndex === 4) {
    // HTN (выше среднего): 15% негатив, 35% нейтрал/средние, 50% восхищение
    if (r < 0.15) return 'negative';
    if (r < 0.5) return 'neutral';
    return 'admiring';
  }
  if (rankIndex === 5) {
    // Chadlite: 15% нейтрально-тёплые, 85% восхищение
    return r < 0.15 ? 'neutral' : 'admiring';
  }
  // Chad (6) и True Adam (7): 100% восхищение
  return 'admiring';
}

export function pickPhraseByTone(
  tone: MessageTone,
  excludePhrase?: string
): string {
  const pool =
    tone === 'negative'
      ? NEGATIVE_GIRL_PHRASES
      : tone === 'neutral'
      ? NEUTRAL_MIXED_GIRL_PHRASES
      : ADMIRING_GIRL_PHRASES;

  if (pool.length <= 1) return pool[0] || '';
  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    if (candidate !== excludePhrase) return candidate;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

interface PhoneMessengerAppProps {
  currentRankIndex: number;
  currentRankTitle: string;
  dialogs: MessengerDialogItem[];
  activeFilter: 'all' | 'unread';
  setActiveFilter: (filter: 'all' | 'unread') => void;
  onMarkDialogRead: (girlId: string) => void;
  onMarkAllRead: () => void;
  notificationsMuted: boolean;
  onToggleNotificationsMuted: () => void;
}

export const PhoneMessengerApp: React.FC<PhoneMessengerAppProps> = ({
  currentRankIndex,
  currentRankTitle,
  dialogs,
  activeFilter,
  setActiveFilter,
  onMarkDialogRead,
  onMarkAllRead,
  notificationsMuted,
  onToggleNotificationsMuted,
}) => {
  const tierMode: 'low' | 'mid' | 'high' =
    currentRankIndex <= 1 ? 'low' : currentRankIndex <= 4 ? 'mid' : 'high';
  const totalUnread = dialogs.reduce((acc, d) => acc + d.unreadCount, 0);

  const visibleDialogs =
    activeFilter === 'unread'
      ? dialogs.filter((d) => d.unreadCount > 0 || d.isTyping)
      : dialogs;

  return (
    <div className="flex-1 flex flex-col bg-[#17212B] text-white select-none overflow-hidden">
      {/* Верхняя шапка в стиле Telegram Night Mode (#212D3B) */}
      <div className="bg-[#212D3B] px-3.5 pt-2.5 pb-0 border-b border-[#0E1621] shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Иконка бургер-меню Telegram */}
            <div className="w-7 h-7 rounded-full flex flex-col items-center justify-center gap-[3px] text-[#7F91A4] shrink-0">
              <span className="w-4 h-[2px] rounded-full bg-current" />
              <span className="w-4 h-[2px] rounded-full bg-current" />
              <span className="w-4 h-[2px] rounded-full bg-current" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-bold tracking-tight text-white truncate">
                  ТелеГрамм
                </span>
                {totalUnread > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold text-white ${
                      notificationsMuted ? 'bg-[#3E546A]' : 'bg-[#3E99E6]'
                    }`}
                  >
                    {totalUnread}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-[#7F91A4] truncate">
                {tierMode === 'high'
                  ? `Статус ${currentRankTitle} · Поток восхищения 🔥`
                  : tierMode === 'mid'
                  ? `Статус ${currentRankTitle} · Смешанные реакции ⚖️`
                  : `Статус ${currentRankTitle} · Френдзона и отказы`}
              </div>
            </div>
          </div>

          {/* Кнопки управления уведомлениями и прочтением чатов */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onToggleNotificationsMuted}
              title={
                notificationsMuted
                  ? 'Включить всплывающие уведомления о сообщениях'
                  : 'Отключить всплывающие уведомления о сообщениях'
              }
              className={`px-2 py-1 rounded-md text-[10px] font-medium flex items-center gap-1 border transition-colors cursor-pointer ${
                notificationsMuted
                  ? 'bg-[#17212B] border-rose-500/40 text-rose-300 hover:bg-rose-500/15'
                  : 'bg-[#2B5278]/75 border-[#5288C1]/40 text-[#6AB3F3] hover:bg-[#2B5278]'
              }`}
            >
              {notificationsMuted ? (
                <>
                  <svg viewBox="0 0 20 20" className="w-3 h-3 fill-current shrink-0">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    <path
                      d="M3 3l14 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>Без звука</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" className="w-3 h-3 fill-current shrink-0">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  <span>Уведомл.</span>
                </>
              )}
            </button>

            {totalUnread > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                title="Отметить все как прочитанные"
                className="px-2 py-1 rounded-md text-[10px] font-medium bg-[#2B5278]/70 hover:bg-[#2B5278] text-[#6AB3F3] transition-colors cursor-pointer"
              >
                Прочит.
              </button>
            )}
          </div>
        </div>

        {/* Строка поиска Telegram */}
        <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-[#17212B] flex items-center justify-between gap-2 text-[11px] text-[#6C7883]">
          <div className="flex items-center gap-2 truncate">
            <svg
              viewBox="0 0 20 20"
              className="w-3.5 h-3.5 fill-current shrink-0 opacity-80"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate">
              {tierMode === 'high'
                ? 'Входящие от девушек (восхищение)...'
                : tierMode === 'mid'
                ? 'Микс: негатив, нейтральные и комплименты...'
                : 'Входящие от девушек (негатив и игнор)...'}
            </span>
          </div>
          <span
            className={`text-[10px] font-mono font-semibold shrink-0 ${
              tierMode === 'high'
                ? 'text-[#4ECC5E]'
                : tierMode === 'mid'
                ? 'text-[#FBBF24]'
                : 'text-[#F87171]'
            }`}
          >
            {tierMode === 'high'
              ? 'ТОП АУРА'
              : tierMode === 'mid'
              ? 'СРЕДНИЙ PSL'
              : 'НИЗКИЙ PSL'}
          </span>
        </div>

        {/* Папки чатов Telegram */}
        <div className="mt-2 flex items-center gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'all'
                ? 'border-[#5288C1] text-[#6AB3F3]'
                : 'border-transparent text-[#7F91A4] hover:text-white'
            }`}
          >
            <span>Все чаты</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#2B5278]/60 text-[#6AB3F3]">
              {dialogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'unread'
                ? 'border-[#5288C1] text-[#6AB3F3]'
                : 'border-transparent text-[#7F91A4] hover:text-white'
            }`}
          >
            <span>Новые</span>
            {totalUnread > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#3E99E6] text-white">
                {totalUnread}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Главный список диалогов Telegram (без перехода внутрь чата по условию) */}
      <div className="flex-1 overflow-y-auto max-h-[520px] divide-y divide-[#0E1621]">
        {visibleDialogs.length === 0 ? (
          <div className="py-12 px-4 text-center text-xs text-[#7F91A4]">
            Все входящие сообщения прочитаны. Новые сообщения от девушек приходят каждые несколько секунд!
          </div>
        ) : (
          visibleDialogs.map((item) => {
            const { girl, lastMessage, timeLabel, unreadCount, isTyping, tone } = item;

            return (
              <div
                key={girl.id}
                onClick={() => {
                  if (unreadCount > 0) {
                    onMarkDialogRead(girl.id);
                  }
                }}
                title="Главная панель сообщений (нажмите, чтобы пометить прочитанным)"
                className={`px-3 py-2.5 flex items-center gap-3 transition-colors ${
                  unreadCount > 0
                    ? 'bg-[#202B36]/85 hover:bg-[#24303D] cursor-pointer'
                    : 'bg-[#17212B] hover:bg-[#1C2733] cursor-default'
                }`}
              >
                {/* Круглая аватарка девушки + зелёный индикатор онлайна */}
                <div className="relative w-11 h-11 rounded-full shrink-0">
                  <div
                    className={`w-full h-full rounded-full bg-gradient-to-br ${girl.avatarBg} flex items-center justify-center overflow-hidden border border-white/15 shadow-inner`}
                  >
                    {/* Стилизованный женский силуэт/портрет */}
                    <svg viewBox="0 0 48 48" className="w-10 h-10">
                      {/* Прическа */}
                      <path
                        d="M10 38 C9 22, 13 9, 24 9 C35 9, 39 22, 38 38 Z"
                        fill={girl.hairColor}
                      />
                      {/* Шея и плечи */}
                      <path
                        d="M14 46 C14 38, 34 38, 34 46 Z"
                        fill="#FDE6D8"
                      />
                      <rect x="21" y="31" width="6" height="8" rx="3" fill="#FDE6D8" />
                      {/* Лицо */}
                      <ellipse cx="24" cy="23" rx="8.5" ry="10" fill="#FFE4D6" />
                      {/* Челка */}
                      <path
                        d="M15 21 C16 13, 32 13, 33 21 C30 16, 19 16, 15 21 Z"
                        fill={girl.hairColor}
                      />
                      {/* Глаза и ресницы */}
                      <ellipse cx="20.8" cy="23" rx="1.2" ry="1.4" fill="#1E293B" />
                      <ellipse cx="27.2" cy="23" rx="1.2" ry="1.4" fill="#1E293B" />
                      {/* Румянец и губы */}
                      <circle cx="18.8" cy="25.5" r="1.5" fill="#FB7185" opacity="0.45" />
                      <circle cx="29.2" cy="25.5" r="1.5" fill="#FB7185" opacity="0.45" />
                      <path
                        d={
                          tone === 'negative'
                            ? 'M22 28.8 Q24 27.8 26 28.8'
                            : tone === 'neutral'
                            ? 'M21.8 28.4 Q24 28.6 26.2 28.4'
                            : 'M21.5 28 Q24 30.2 26.5 28'
                        }
                        stroke="#E11D48"
                        strokeWidth="1.4"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Точка онлайна Telegram */}
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#4ECC5E] ring-2 ring-[#17212B]" />
                </div>

                {/* Центральная колонка: Имя + Био-тег + Текст сообщения */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[13px] font-semibold text-white truncate">
                        {girl.name}
                      </span>
                      {girl.isPremium && (
                        <span
                          title="Telegram Premium"
                          className="text-[10px] text-[#6AB3F3] shrink-0"
                        >
                          ★
                        </span>
                      )}
                      <span className="text-[10px] text-[#6C7883] truncate">
                        · {girl.bioTag}
                      </span>
                    </div>

                    {/* Время последнего сообщения */}
                    <span
                      className={`text-[10px] font-mono tabular-nums shrink-0 ${
                        unreadCount > 0 ? 'text-[#6AB3F3] font-semibold' : 'text-[#6C7883]'
                      }`}
                    >
                      {timeLabel}
                    </span>
                  </div>

                  {/* Вторая строка: превью фразы + бейдж непрочитанных */}
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {isTyping ? (
                      <div className="text-xs text-[#6AB3F3] font-medium flex items-center gap-1 truncate">
                        <span>печатает</span>
                        <span className="inline-flex gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-[#6AB3F3] animate-bounce" />
                          <span className="w-1 h-1 rounded-full bg-[#6AB3F3] animate-bounce [animation-delay:150ms]" />
                          <span className="w-1 h-1 rounded-full bg-[#6AB3F3] animate-bounce [animation-delay:300ms]" />
                        </span>
                      </div>
                    ) : (
                      <p
                        className={`text-xs line-clamp-2 leading-snug ${
                          unreadCount > 0
                            ? 'text-[#E8F1F8] font-medium'
                            : tone === 'negative'
                            ? 'text-[#8A9AA9]'
                            : tone === 'neutral'
                            ? 'text-[#9FB2C4]'
                            : 'text-[#A8C5E0]'
                        }`}
                      >
                        {lastMessage}
                      </p>
                    )}

                    {unreadCount > 0 ? (
                      <span
                        className={`px-1.5 min-w-[20px] h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center shrink-0 ${
                          tone === 'negative'
                            ? 'bg-[#3E546A] text-white'
                            : tone === 'neutral'
                            ? 'bg-[#2B6CB0] text-white'
                            : 'bg-[#3E99E6] text-white shadow-[0_0_8px_rgba(62,153,230,0.45)]'
                        }`}
                      >
                        {unreadCount}
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#5288C1] shrink-0">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Нижняя подсказка о разблокировке новых девушек с ростом ранга */}
      <div className="px-3 py-2 bg-[#212D3B] border-t border-[#0E1621] flex items-center justify-between text-[10px] text-[#7F91A4]">
        <span>
          Открыто девушек: <strong className="text-white">{dialogs.length} из {GIRL_CONTACTS.length}</strong>
        </span>
        <span className="text-[#6AB3F3]">
          {currentRankIndex < 7
            ? 'Повышай уровень PSL → больше девушек и симпатий'
            : 'Все 22 девушки восхищаются тобой!'}
        </span>
      </div>
    </div>
  );
};
