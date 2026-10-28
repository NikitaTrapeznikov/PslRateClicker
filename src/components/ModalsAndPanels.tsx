/**
 * Компактный фасад реэкспорта вкладок для обратной совместимости импортов.
 * Сами реализации вынесены в отдельные модули для мгновенного чтения и редактирования:
 * - src/components/OlympusTitansBattleBackdrop.tsx (2D UV Puppet-Pin авто-бой греческих статуй)
 * - src/components/EvolutionAtlasView.tsx (Вкладка «Эволюция PSL — 8 стадий»)
 * - src/components/GeneticsRebirthView.tsx (Вкладка «Поколения и ДНК» + космический фон с Адамами)
 * - src/components/LeaderboardAndBalanceView.tsx (Вкладка «Рейтинг и Баланс»)
 */

export { OlympusTitansBattleBackdrop } from './OlympusTitansBattleBackdrop';
export { EvolutionAtlasView, type EvolutionViewProps } from './EvolutionAtlasView';
export {
  GeneticsRebirthView,
  RebirthStarryBackground,
  type RebirthViewProps,
} from './GeneticsRebirthView';
export {
  LeaderboardAndBalanceView,
  type LeaderboardAndBalanceViewProps,
} from './LeaderboardAndBalanceView';
