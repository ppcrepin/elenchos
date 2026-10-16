// La table des lettres qui imitent les nôtres (E7) : chaque caractère d'un autre alphabet (ou d'une autre forme)
// qui ressemble à une lettre latine ou à un chiffre, et la lettre ou le chiffre qu'il imite. Elle sert au squelette
// d'un pseudo (cercle.ts), donc à « pseudo_comparaison » : « Mаrie » écrit avec un « а » cyrillique ne passe pas pour un
// autre pseudo que « Marie ».
//
// FICHIER FABRIQUÉ, à ne pas modifier à la main : node outils/confusables.ts confusables.txt (la règle de choix est en
// tête de l'outil). Source : confusables.txt d'Unicode 16.0.0 (UTS #39), SHA-256
// 95bd0aad6dced5ebc63436f459c06ab21a8d107cd842fb57f5c3a1e91bca8611.
// 1462 caractères. Les caractères sont écrits par leur numéro (\u{…}), jamais tels quels : certains
// s'écrivent de droite à gauche, et le code doit se lire sans surprise.

/** Pour chaque lettre ou chiffre, les caractères qui l'imitent. */
const IMITATIONS: Readonly<Record<string, string>> = {
  2: '\u{1A8}\u{1BB}\u{3E9}\u{14BF}\u{A645}\u{A6EF}\u{A75B}\u{1CCF2}\u{1D7D0}\u{1D7DA}'
    + '\u{1D7E4}\u{1D7EE}\u{1D7F8}\u{1FBF2}',
  3: '\u{21D}\u{25C}\u{292}\u{437}\u{499}\u{4E1}\u{2CCD}\u{A76B}\u{118CA}\u{16F3B}'
    + '\u{1CCF3}\u{1D206}\u{1D7D1}\u{1D7DB}\u{1D7E5}\u{1D7EF}\u{1D7F9}\u{1FBF3}',
  4: '\u{AB9E}\u{118CF}\u{1CCF4}\u{1D7D2}\u{1D7DC}\u{1D7E6}\u{1D7F0}\u{1D7FA}\u{1FBF4}',
  5: '\u{118DB}\u{1CCF5}\u{1D7D3}\u{1D7DD}\u{1D7E7}\u{1D7F1}\u{1D7FB}\u{1FBF5}',
  6: '\u{431}\u{2CD3}\u{ABBE}\u{118D5}\u{1CCF6}\u{1D7D4}\u{1D7DE}\u{1D7E8}\u{1D7F2}\u{1D7FC}'
    + '\u{1FBF6}',
  7: '\u{104FA}\u{118C6}\u{1CCF7}\u{1D212}\u{1D7D5}\u{1D7DF}\u{1D7E9}\u{1D7F3}\u{1D7FD}\u{1FBF7}',
  8: '\u{223}\u{9EA}\u{A6A}\u{B03}\u{1031A}\u{1CCF8}\u{1D7D6}\u{1D7E0}\u{1D7EA}\u{1D7F4}'
    + '\u{1D7FE}\u{1E8CB}\u{1FBF8}',
  9: '\u{9ED}\u{A67}\u{B68}\u{D6D}\u{2CCB}\u{A76F}\u{118CC}\u{118D6}\u{1CCF9}\u{1D7D7}'
    + '\u{1D7E1}\u{1D7EB}\u{1D7F5}\u{1D7FF}\u{1FBF9}',
  a: '\u{251}\u{3B1}\u{430}\u{15C5}\u{1E9A}\u{2376}\u{237A}\u{A4EE}\u{AB7A}\u{FF41}'
    + '\u{102A0}\u{16F40}\u{1CCD6}\u{1D400}\u{1D41A}\u{1D434}\u{1D44E}\u{1D468}\u{1D482}\u{1D49C}'
    + '\u{1D4B6}\u{1D4D0}\u{1D4EA}\u{1D504}\u{1D51E}\u{1D538}\u{1D552}\u{1D56C}\u{1D586}\u{1D5A0}'
    + '\u{1D5BA}\u{1D5D4}\u{1D5EE}\u{1D608}\u{1D622}\u{1D63C}\u{1D656}\u{1D670}\u{1D68A}\u{1D6A8}'
    + '\u{1D6C2}\u{1D6E2}\u{1D6FC}\u{1D71C}\u{1D736}\u{1D756}\u{1D770}\u{1D790}\u{1D7AA}',
  b: '\u{180}\u{183}\u{185}\u{253}\u{3B2}\u{432}\u{44C}\u{463}\u{48D}\u{13FC}'
    + '\u{1472}\u{1473}\u{15AF}\u{15F7}\u{212C}\u{A4D0}\u{A7B5}\u{AB9F}\u{FF42}\u{10282}'
    + '\u{102A1}\u{10301}\u{1CCD7}\u{1D401}\u{1D41B}\u{1D435}\u{1D44F}\u{1D469}\u{1D483}\u{1D4B7}'
    + '\u{1D4D1}\u{1D4EB}\u{1D505}\u{1D51F}\u{1D539}\u{1D553}\u{1D56D}\u{1D587}\u{1D5A1}\u{1D5BB}'
    + '\u{1D5D5}\u{1D5EF}\u{1D609}\u{1D623}\u{1D63D}\u{1D657}\u{1D671}\u{1D68B}\u{1D6A9}\u{1D6E3}'
    + '\u{1D71D}\u{1D757}\u{1D791}',
  c: '\u{A2}\u{23C}\u{3F2}\u{441}\u{4AB}\u{1D04}\u{20A1}\u{2102}\u{212D}\u{217D}'
    + '\u{2CA5}\u{A4DA}\u{ABAF}\u{FF43}\u{102A2}\u{10302}\u{1043D}\u{1051C}\u{118E9}\u{118F2}'
    + '\u{1CCD8}\u{1D402}\u{1D41C}\u{1D436}\u{1D450}\u{1D46A}\u{1D484}\u{1D49E}\u{1D4B8}\u{1D4D2}'
    + '\u{1D4EC}\u{1D520}\u{1D554}\u{1D56E}\u{1D588}\u{1D5A2}\u{1D5BC}\u{1D5D6}\u{1D5F0}\u{1D60A}'
    + '\u{1D624}\u{1D63E}\u{1D658}\u{1D672}\u{1D68C}\u{1F74C}',
  d: '\u{F0}\u{111}\u{18C}\u{256}\u{257}\u{501}\u{146F}\u{15DE}\u{15EA}\u{20AB}'
    + '\u{2145}\u{2146}\u{217E}\u{A4D2}\u{A4D3}\u{AB70}\u{ABB7}\u{1CCD9}\u{1D403}\u{1D41D}'
    + '\u{1D437}\u{1D451}\u{1D46B}\u{1D485}\u{1D49F}\u{1D4B9}\u{1D4D3}\u{1D4ED}\u{1D507}\u{1D521}'
    + '\u{1D53B}\u{1D555}\u{1D56F}\u{1D589}\u{1D5A3}\u{1D5BD}\u{1D5D7}\u{1D5F1}\u{1D60B}\u{1D625}'
    + '\u{1D63F}\u{1D659}\u{1D673}\u{1D68D}',
  e: '\u{247}\u{3B5}\u{435}\u{4BD}\u{4BF}\u{212E}\u{212F}\u{2130}\u{2147}\u{22FF}'
    + '\u{2D39}\u{A4F0}\u{AB32}\u{AB7C}\u{FF45}\u{10286}\u{118CE}\u{1CCDA}\u{1D404}\u{1D41E}'
    + '\u{1D438}\u{1D452}\u{1D46C}\u{1D486}\u{1D4D4}\u{1D4EE}\u{1D508}\u{1D522}\u{1D53C}\u{1D556}'
    + '\u{1D570}\u{1D58A}\u{1D5A4}\u{1D5BE}\u{1D5D8}\u{1D5F2}\u{1D60C}\u{1D626}\u{1D640}\u{1D65A}'
    + '\u{1D674}\u{1D68E}\u{1D6AC}\u{1D6E6}\u{1D720}\u{1D75A}\u{1D794}',
  f: '\u{17F}\u{192}\u{3DD}\u{584}\u{15B4}\u{1D6E}\u{1E9D}\u{2131}\u{A4DD}\u{A799}'
    + '\u{AB35}\u{10287}\u{102A5}\u{10525}\u{118C2}\u{1CCDB}\u{1D213}\u{1D405}\u{1D41F}\u{1D439}'
    + '\u{1D453}\u{1D46D}\u{1D487}\u{1D4BB}\u{1D4D5}\u{1D4EF}\u{1D509}\u{1D523}\u{1D53D}\u{1D557}'
    + '\u{1D571}\u{1D58B}\u{1D5A5}\u{1D5BF}\u{1D5D9}\u{1D5F3}\u{1D60D}\u{1D627}\u{1D641}\u{1D65B}'
    + '\u{1D675}\u{1D68F}\u{1D7CA}',
  g: '\u{18D}\u{1E5}\u{260}\u{261}\u{50D}\u{581}\u{13FB}\u{1D83}\u{210A}\u{A4D6}'
    + '\u{AB90}\u{FF47}\u{1CCDC}\u{1D406}\u{1D420}\u{1D43A}\u{1D454}\u{1D46E}\u{1D488}\u{1D4A2}'
    + '\u{1D4D6}\u{1D4F0}\u{1D50A}\u{1D524}\u{1D53E}\u{1D558}\u{1D572}\u{1D58C}\u{1D5A6}\u{1D5C0}'
    + '\u{1D5DA}\u{1D5F4}\u{1D60E}\u{1D628}\u{1D642}\u{1D65C}\u{1D676}\u{1D690}',
  h: '\u{127}\u{266}\u{43D}\u{45B}\u{4A3}\u{4BB}\u{4C8}\u{4CA}\u{570}\u{13FA}'
    + '\u{157C}\u{210B}\u{210C}\u{210D}\u{210E}\u{210F}\u{2C68}\u{2C8F}\u{A4E7}\u{A695}'
    + '\u{AB8B}\u{AB92}\u{FF48}\u{102CF}\u{1CCDD}\u{1D407}\u{1D421}\u{1D43B}\u{1D46F}\u{1D489}'
    + '\u{1D4BD}\u{1D4D7}\u{1D4F1}\u{1D525}\u{1D559}\u{1D573}\u{1D58D}\u{1D5A7}\u{1D5C1}\u{1D5DB}'
    + '\u{1D5F5}\u{1D60F}\u{1D629}\u{1D643}\u{1D65D}\u{1D677}\u{1D691}\u{1D6AE}\u{1D6E8}\u{1D722}'
    + '\u{1D75C}\u{1D796}',
  i: '\u{131}\u{268}\u{269}\u{26A}\u{2DB}\u{37A}\u{3B9}\u{456}\u{4CF}\u{1D7B}'
    + '\u{1D7C}\u{2139}\u{2148}\u{2170}\u{2373}\u{2378}\u{A647}\u{AB75}\u{FF49}\u{118C3}'
    + '\u{1D422}\u{1D456}\u{1D48A}\u{1D4BE}\u{1D4F2}\u{1D526}\u{1D55A}\u{1D58E}\u{1D5C2}\u{1D5F6}'
    + '\u{1D62A}\u{1D65E}\u{1D692}\u{1D6A4}\u{1D6CA}\u{1D704}\u{1D73E}\u{1D778}\u{1D7B2}',
  j: '\u{249}\u{29D}\u{3F3}\u{458}\u{148D}\u{2149}\u{A4D9}\u{AB7B}\u{FF4A}\u{1CCDF}'
    + '\u{1D409}\u{1D423}\u{1D43D}\u{1D457}\u{1D471}\u{1D48B}\u{1D4A5}\u{1D4BF}\u{1D4D9}\u{1D4F3}'
    + '\u{1D50D}\u{1D527}\u{1D541}\u{1D55B}\u{1D575}\u{1D58F}\u{1D5A9}\u{1D5C3}\u{1D5DD}\u{1D5F7}'
    + '\u{1D611}\u{1D62B}\u{1D645}\u{1D65F}\u{1D679}\u{1D693}',
  k: '\u{199}\u{3BA}\u{43A}\u{49B}\u{49F}\u{16D5}\u{20AD}\u{2C6A}\u{2C95}\u{A4D7}'
    + '\u{A741}\u{ABB6}\u{FF4B}\u{10518}\u{1CCE0}\u{1D40A}\u{1D424}\u{1D43E}\u{1D458}\u{1D472}'
    + '\u{1D48C}\u{1D4A6}\u{1D4C0}\u{1D4DA}\u{1D4F4}\u{1D50E}\u{1D528}\u{1D542}\u{1D55C}\u{1D576}'
    + '\u{1D590}\u{1D5AA}\u{1D5C4}\u{1D5DE}\u{1D5F8}\u{1D612}\u{1D62C}\u{1D646}\u{1D660}\u{1D67A}'
    + '\u{1D694}\u{1D6B1}\u{1D6EB}\u{1D725}\u{1D75F}\u{1D799}',
  l: '\u{142}\u{19A}\u{1C0}\u{26B}\u{26D}\u{5C0}\u{5D5}\u{5DF}\u{627}\u{661}'
    + '\u{673}\u{6F1}\u{7CA}\u{14AA}\u{16C1}\u{2110}\u{2111}\u{2112}\u{2113}\u{217C}'
    + '\u{2223}\u{23FD}\u{2C93}\u{2CD1}\u{2D4F}\u{A4E1}\u{A4F2}\u{ABAE}\u{FD3C}\u{FD3D}'
    + '\u{FE87}\u{FE88}\u{FE8D}\u{FE8E}\u{FF4C}\u{FFE8}\u{1028A}\u{10309}\u{10320}\u{10443}'
    + '\u{10526}\u{118D2}\u{16F16}\u{16F28}\u{1CCDE}\u{1CCE1}\u{1CCF1}\u{1D22A}\u{1D408}\u{1D40B}'
    + '\u{1D425}\u{1D43C}\u{1D43F}\u{1D459}\u{1D470}\u{1D473}\u{1D48D}\u{1D4C1}\u{1D4D8}\u{1D4DB}'
    + '\u{1D4F5}\u{1D50F}\u{1D529}\u{1D540}\u{1D543}\u{1D55D}\u{1D574}\u{1D577}\u{1D591}\u{1D5A8}'
    + '\u{1D5AB}\u{1D5C5}\u{1D5DC}\u{1D5DF}\u{1D5F9}\u{1D610}\u{1D613}\u{1D62D}\u{1D644}\u{1D647}'
    + '\u{1D661}\u{1D678}\u{1D67B}\u{1D695}\u{1D6B0}\u{1D6EA}\u{1D724}\u{1D75E}\u{1D798}\u{1D7CF}'
    + '\u{1D7D9}\u{1D7E3}\u{1D7ED}\u{1D7F7}\u{1E8C7}\u{1EE00}\u{1EE80}\u{1FBF1}',
  m: '\u{3BC}\u{3FB}\u{43C}\u{4CE}\u{15F0}\u{16D6}\u{2133}\u{217F}\u{2C99}\u{A4DF}'
    + '\u{AB87}\u{FF4D}\u{102B0}\u{10311}\u{1CCE2}\u{1D40C}\u{1D440}\u{1D474}\u{1D4DC}\u{1D510}'
    + '\u{1D544}\u{1D578}\u{1D5AC}\u{1D5E0}\u{1D614}\u{1D648}\u{1D67C}\u{1D6B3}\u{1D6ED}\u{1D727}'
    + '\u{1D761}\u{1D79B}',
  n: '\u{19E}\u{272}\u{273}\u{3B7}\u{578}\u{57C}\u{1D70}\u{2115}\u{2C9B}\u{A4E0}'
    + '\u{FF4E}\u{1018E}\u{10513}\u{1CCE3}\u{1D40D}\u{1D427}\u{1D441}\u{1D45B}\u{1D475}\u{1D48F}'
    + '\u{1D4A9}\u{1D4C3}\u{1D4DD}\u{1D4F7}\u{1D511}\u{1D52B}\u{1D55F}\u{1D579}\u{1D593}\u{1D5AD}'
    + '\u{1D5C7}\u{1D5E1}\u{1D5FB}\u{1D615}\u{1D62F}\u{1D649}\u{1D663}\u{1D67D}\u{1D697}\u{1D6B4}'
    + '\u{1D6C8}\u{1D6EE}\u{1D702}\u{1D728}\u{1D73C}\u{1D762}\u{1D776}\u{1D79C}\u{1D7B0}',
  o: '\u{F8}\u{275}\u{3B8}\u{3BF}\u{3C3}\u{3D1}\u{43E}\u{473}\u{4E9}\u{585}'
    + '\u{5E1}\u{647}\u{665}\u{6BE}\u{6C1}\u{6D5}\u{6F5}\u{6FF}\u{7C0}\u{966}'
    + '\u{9E6}\u{A66}\u{AE6}\u{B20}\u{B66}\u{BE6}\u{C02}\u{C66}\u{C82}\u{CE6}'
    + '\u{D02}\u{D20}\u{D66}\u{D82}\u{E50}\u{ED0}\u{101D}\u{1040}\u{10FF}\u{12D0}'
    + '\u{1D0F}\u{1D11}\u{2134}\u{2296}\u{229D}\u{236C}\u{2C9F}\u{2D31}\u{2D41}\u{2D54}'
    + '\u{3007}\u{A4F3}\u{A74B}\u{AB3D}\u{AB3E}\u{AB74}\u{AB8E}\u{ABBB}\u{FBA6}\u{FBA7}'
    + '\u{FBA8}\u{FBA9}\u{FBAA}\u{FBAB}\u{FBAC}\u{FBAD}\u{FCD9}\u{FEE9}\u{FEEA}\u{FEEB}'
    + '\u{FEEC}\u{FF4F}\u{10292}\u{102AB}\u{1042C}\u{104EA}\u{10516}\u{114D0}\u{118C8}\u{118D7}'
    + '\u{118E0}\u{1CCE4}\u{1CCF0}\u{1D21A}\u{1D40E}\u{1D428}\u{1D442}\u{1D45C}\u{1D476}\u{1D490}'
    + '\u{1D4AA}\u{1D4DE}\u{1D4F8}\u{1D512}\u{1D52C}\u{1D546}\u{1D560}\u{1D57A}\u{1D594}\u{1D5AE}'
    + '\u{1D5C8}\u{1D5E2}\u{1D5FC}\u{1D616}\u{1D630}\u{1D64A}\u{1D664}\u{1D67E}\u{1D698}\u{1D6AF}'
    + '\u{1D6B6}\u{1D6B9}\u{1D6C9}\u{1D6D0}\u{1D6D4}\u{1D6DD}\u{1D6E9}\u{1D6F0}\u{1D6F3}\u{1D703}'
    + '\u{1D70A}\u{1D70E}\u{1D717}\u{1D723}\u{1D72A}\u{1D72D}\u{1D73D}\u{1D744}\u{1D748}\u{1D751}'
    + '\u{1D75D}\u{1D764}\u{1D767}\u{1D777}\u{1D77E}\u{1D782}\u{1D78B}\u{1D797}\u{1D79E}\u{1D7A1}'
    + '\u{1D7B1}\u{1D7B8}\u{1D7BC}\u{1D7C5}\u{1D7CE}\u{1D7D8}\u{1D7E2}\u{1D7EC}\u{1D7F6}\u{1EE24}'
    + '\u{1EE64}\u{1EE84}\u{1F714}\u{1FBF0}',
  p: '\u{1A5}\u{3C1}\u{3F1}\u{440}\u{146D}\u{1D7D}\u{2119}\u{2374}\u{2CA3}\u{A4D1}'
    + '\u{ABB2}\u{FF50}\u{10295}\u{1CCE5}\u{1D40F}\u{1D429}\u{1D443}\u{1D45D}\u{1D477}\u{1D491}'
    + '\u{1D4AB}\u{1D4C5}\u{1D4DF}\u{1D4F9}\u{1D513}\u{1D52D}\u{1D561}\u{1D57B}\u{1D595}\u{1D5AF}'
    + '\u{1D5C9}\u{1D5E3}\u{1D5FD}\u{1D617}\u{1D631}\u{1D64B}\u{1D665}\u{1D67F}\u{1D699}\u{1D6B8}'
    + '\u{1D6D2}\u{1D6E0}\u{1D6F2}\u{1D70C}\u{1D71A}\u{1D72C}\u{1D746}\u{1D754}\u{1D766}\u{1D780}'
    + '\u{1D78E}\u{1D7A0}\u{1D7BA}\u{1D7C8}',
  q: '\u{2A0}\u{51B}\u{563}\u{566}\u{211A}\u{2D55}\u{1CCE6}\u{1D410}\u{1D42A}\u{1D444}'
    + '\u{1D45E}\u{1D478}\u{1D492}\u{1D4AC}\u{1D4C6}\u{1D4E0}\u{1D4FA}\u{1D514}\u{1D52E}\u{1D562}'
    + '\u{1D57C}\u{1D596}\u{1D5B0}\u{1D5CA}\u{1D5E4}\u{1D5FE}\u{1D618}\u{1D632}\u{1D64C}\u{1D666}'
    + '\u{1D680}\u{1D69A}',
  r: '\u{24D}\u{27C}\u{27D}\u{280}\u{433}\u{493}\u{1587}\u{1D26}\u{1D72}\u{211B}'
    + '\u{211C}\u{211D}\u{2C85}\u{A4E3}\u{AB47}\u{AB48}\u{AB71}\u{AB81}\u{ABA2}\u{104DC}'
    + '\u{16F35}\u{1CCE7}\u{1D216}\u{1D411}\u{1D42B}\u{1D445}\u{1D45F}\u{1D479}\u{1D493}\u{1D4C7}'
    + '\u{1D4E1}\u{1D4FB}\u{1D52F}\u{1D563}\u{1D57D}\u{1D597}\u{1D5B1}\u{1D5CB}\u{1D5E5}\u{1D5FF}'
    + '\u{1D619}\u{1D633}\u{1D64D}\u{1D667}\u{1D681}\u{1D69B}',
  s: '\u{1BD}\u{282}\u{455}\u{57F}\u{1D74}\u{A4E2}\u{A731}\u{ABA5}\u{ABAA}\u{FF53}'
    + '\u{10296}\u{10448}\u{118C1}\u{16F3A}\u{1CCE8}\u{1D412}\u{1D42C}\u{1D446}\u{1D460}\u{1D47A}'
    + '\u{1D494}\u{1D4AE}\u{1D4C8}\u{1D4E2}\u{1D4FC}\u{1D516}\u{1D530}\u{1D54A}\u{1D564}\u{1D57E}'
    + '\u{1D598}\u{1D5B2}\u{1D5CC}\u{1D5E6}\u{1D600}\u{1D61A}\u{1D634}\u{1D64E}\u{1D668}\u{1D682}'
    + '\u{1D69C}',
  t: '\u{167}\u{1AD}\u{288}\u{3C4}\u{442}\u{4AD}\u{1D75}\u{20AE}\u{22A4}\u{2361}'
    + '\u{27D9}\u{2C66}\u{2CA7}\u{A4D4}\u{AB72}\u{FF54}\u{10297}\u{102B1}\u{10315}\u{16F0A}'
    + '\u{1CCE9}\u{1D413}\u{1D42D}\u{1D447}\u{1D461}\u{1D47B}\u{1D495}\u{1D4AF}\u{1D4C9}\u{1D4E3}'
    + '\u{1D4FD}\u{1D517}\u{1D531}\u{1D54B}\u{1D565}\u{1D57F}\u{1D599}\u{1D5B3}\u{1D5CD}\u{1D5E7}'
    + '\u{1D601}\u{1D61B}\u{1D635}\u{1D64F}\u{1D669}\u{1D683}\u{1D69D}\u{1D6BB}\u{1D6F5}\u{1D72F}'
    + '\u{1D769}\u{1D7A3}\u{1F768}',
  u: '\u{289}\u{28B}\u{3C5}\u{57D}\u{1200}\u{144C}\u{1D1C}\u{1D7E}\u{222A}\u{22C3}'
    + '\u{A4F4}\u{A79F}\u{AB4E}\u{AB52}\u{AB9C}\u{104F6}\u{118D8}\u{16F42}\u{1CCEA}\u{1D414}'
    + '\u{1D42E}\u{1D448}\u{1D462}\u{1D47C}\u{1D496}\u{1D4B0}\u{1D4CA}\u{1D4E4}\u{1D4FE}\u{1D518}'
    + '\u{1D532}\u{1D54C}\u{1D566}\u{1D580}\u{1D59A}\u{1D5B4}\u{1D5CE}\u{1D5E8}\u{1D602}\u{1D61C}'
    + '\u{1D636}\u{1D650}\u{1D66A}\u{1D684}\u{1D69E}\u{1D6D6}\u{1D710}\u{1D74A}\u{1D784}\u{1D7BE}',
  v: '\u{3BD}\u{475}\u{5D8}\u{667}\u{6F7}\u{142F}\u{1D20}\u{2174}\u{2228}\u{22C1}'
    + '\u{2D38}\u{A4E6}\u{A6DF}\u{ABA9}\u{FF56}\u{10197}\u{1051D}\u{11706}\u{118C0}\u{16F08}'
    + '\u{1CCEB}\u{1D20D}\u{1D415}\u{1D42F}\u{1D449}\u{1D463}\u{1D47D}\u{1D497}\u{1D4B1}\u{1D4CB}'
    + '\u{1D4E5}\u{1D4FF}\u{1D519}\u{1D533}\u{1D54D}\u{1D567}\u{1D581}\u{1D59B}\u{1D5B5}\u{1D5CF}'
    + '\u{1D5E9}\u{1D603}\u{1D61D}\u{1D637}\u{1D651}\u{1D66B}\u{1D685}\u{1D69F}\u{1D6CE}\u{1D708}'
    + '\u{1D742}\u{1D77C}\u{1D7B6}\u{1F708}',
  w: '\u{26F}\u{461}\u{47D}\u{51D}\u{561}\u{1D21}\u{20A9}\u{A4EA}\u{A761}\u{AB83}'
    + '\u{ABA4}\u{114C5}\u{1170A}\u{1170E}\u{1170F}\u{118E6}\u{118EF}\u{1CCEC}\u{1D416}\u{1D430}'
    + '\u{1D44A}\u{1D464}\u{1D47E}\u{1D498}\u{1D4B2}\u{1D4CC}\u{1D4E6}\u{1D500}\u{1D51A}\u{1D534}'
    + '\u{1D54E}\u{1D568}\u{1D582}\u{1D59C}\u{1D5B6}\u{1D5D0}\u{1D5EA}\u{1D604}\u{1D61E}\u{1D638}'
    + '\u{1D652}\u{1D66C}\u{1D686}\u{1D6A0}',
  x: '\u{D7}\u{3C7}\u{445}\u{4B3}\u{1541}\u{157D}\u{166D}\u{166E}\u{16B7}\u{2179}'
    + '\u{2573}\u{292B}\u{292C}\u{2A2F}\u{2A30}\u{2CAD}\u{2D5D}\u{A4EB}\u{AB53}\u{FF58}'
    + '\u{10196}\u{10290}\u{102B4}\u{10317}\u{10322}\u{10527}\u{118EC}\u{1CCED}\u{1D417}\u{1D431}'
    + '\u{1D44B}\u{1D465}\u{1D47F}\u{1D499}\u{1D4B3}\u{1D4CD}\u{1D4E7}\u{1D501}\u{1D51B}\u{1D535}'
    + '\u{1D54F}\u{1D569}\u{1D583}\u{1D59D}\u{1D5B7}\u{1D5D1}\u{1D5EB}\u{1D605}\u{1D61F}\u{1D639}'
    + '\u{1D653}\u{1D66D}\u{1D687}\u{1D6A1}\u{1D6BE}\u{1D6F8}\u{1D732}\u{1D76C}\u{1D7A6}',
  y: '\u{A5}\u{1B4}\u{24F}\u{263}\u{28F}\u{3B3}\u{3D2}\u{443}\u{4AF}\u{4B1}'
    + '\u{10E7}\u{1D8C}\u{1EFF}\u{213D}\u{2CA9}\u{A4EC}\u{AB5A}\u{AB79}\u{AB8D}\u{FF59}'
    + '\u{102B2}\u{118DC}\u{16F43}\u{1CCEE}\u{1D418}\u{1D432}\u{1D44C}\u{1D466}\u{1D480}\u{1D49A}'
    + '\u{1D4B4}\u{1D4CE}\u{1D4E8}\u{1D502}\u{1D51C}\u{1D536}\u{1D550}\u{1D56A}\u{1D584}\u{1D59E}'
    + '\u{1D5B8}\u{1D5D2}\u{1D5EC}\u{1D606}\u{1D620}\u{1D63A}\u{1D654}\u{1D66E}\u{1D688}\u{1D6A2}'
    + '\u{1D6BC}\u{1D6C4}\u{1D6F6}\u{1D6FE}\u{1D730}\u{1D738}\u{1D76A}\u{1D772}\u{1D7A4}\u{1D7AC}',
  z: '\u{1B6}\u{225}\u{290}\u{3B6}\u{1D22}\u{1D76}\u{2124}\u{2128}\u{A4DC}\u{AB93}'
    + '\u{FF5A}\u{102F5}\u{118C4}\u{118C9}\u{118E5}\u{1CCEF}\u{1D419}\u{1D433}\u{1D44D}\u{1D467}'
    + '\u{1D481}\u{1D49B}\u{1D4B5}\u{1D4CF}\u{1D4E9}\u{1D503}\u{1D537}\u{1D56B}\u{1D585}\u{1D59F}'
    + '\u{1D5B9}\u{1D5D3}\u{1D5ED}\u{1D607}\u{1D621}\u{1D63B}\u{1D655}\u{1D66F}\u{1D689}\u{1D6A3}'
    + '\u{1D6AD}\u{1D6E7}\u{1D721}\u{1D75B}\u{1D795}',
};

/** Caractère → la lettre latine (a à z) ou le chiffre qu'il imite. */
export const LETTRES_QUI_IMITENT: Readonly<Record<string, string>> = Object.freeze(Object.fromEntries(
  Object.entries(IMITATIONS).flatMap(([lettre, imitations]) => [...imitations].map((c) => [c, lettre])),
));
