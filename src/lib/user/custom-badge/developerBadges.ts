//开发者勋章数据
export interface DeveloperBadgeEntry {
  oid: string;
  uid: string;
  badges: string[];
}

export const developerBadges: DeveloperBadgeEntry[] = [
  {
    oid: '63c2807d669fa967f17f5559',
    uid: '244373873',
    badges: ['developer'],
  },
  {
    oid: '68dd004586bbc77f84e309ac',
    uid: '277000599',
    badges: ['developer'],
  },
];
