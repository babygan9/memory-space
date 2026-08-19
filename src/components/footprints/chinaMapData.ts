//  Foot Prints生成器 - 省份地图数据
// 来源: https://github.com/itorr/china-ex
// viewBox: 0 0 1134 976
// 路径顺序至关重要：河北必须在北京、天津之前渲染，否则会被覆盖

export type ProvincePath = {
  id: string; // 省份名（简称，如 "黑龙江"）
  fullName: string; // 标准全称，如 "黑龙江省"
  d: string; // SVG path
};

export type ProvinceText = {
  id: string; // 关联的省份 id
  text: string; // 显示文字（可能是省份名的一部分，如 "山"）
  x: number; // 精确 x 坐标
  y: number; // 精确 y 坐标
  fontSize: number; // 字体大小
};

// ============ 路径数据（顺序与原版完全一致） ============
export const PROVINCE_PATHS: ProvincePath[] = [
  { id: "黑龙江", fullName: "黑龙江省", d: "M1100,33v158H894V33H1100z" },
  { id: "甘肃", fullName: "甘肃省", d: "M585,191v371H351V191H585z" },
  { id: "吉林", fullName: "吉林省", d: "M894,191v85h206v-85H894z" },
  { id: "内蒙古", fullName: "内蒙古自治区", d: "M894,33H738v158H499v227h227l168-108V33z" },
  { id: "山东", fullName: "山东省", d: "M779,446v92h139v-92H779z" },
  { id: "河北", fullName: "河北省", d: "M861,310H726v180h117v-95h18V310z" },
  { id: "北京", fullName: "北京市", d: "M763 336h80v52H763Z" },
  { id: "天津", fullName: "天津市", d: "M763,388h80v43h-80V388z" },
  { id: "西藏", fullName: "西藏自治区", d: "M389,770H35V466h354V770z" },
  { id: "新疆", fullName: "新疆维吾尔自治区", d: "M35,466V87h316v379H35z" },
  { id: "河南", fullName: "河南省", d: "M779,490H654v117h125V490z" },
  { id: "安徽", fullName: "安徽省", d: "M852,538h-73v138h73V538z" },
  { id: "山西", fullName: "山西省", d: "M654,418v108h72V418H654z" },
  { id: "湖北", fullName: "湖北省", d: "M779,688v-81H654v81H779z" },
  { id: "青海", fullName: "青海省", d: "M442,626V395H228v231H442z" },
  { id: "辽宁", fullName: "辽宁省", d: "M861,276v119h154V276H861z" },
  { id: "广东", fullName: "广东省", d: "M823,788H679v81h144V788z" },
  { id: "江苏", fullName: "江苏省", d: "M899,538v87h-62v-87H899z" },
  { id: "江西", fullName: "江西省", d: "M852,806V676H749v130H852z" },
  { id: "浙江", fullName: "浙江省", d: "M852,625l74,1v107h-74V625z" },
  { id: "福建", fullName: "福建省", d: "M823,733v107h73V733H823z" },
  { id: "上海", fullName: "上海市", d: "M882 602h72v47H882Z" },
  { id: "陕西", fullName: "陕西省", d: "M585,653h69V418h-69V653z" },
  { id: "湖南", fullName: "湖南省", d: "M654,688h95v100h-95V688z" },
  { id: "广西", fullName: "广西壮族自治区", d: "M679,788H537v81h142V788z" },
  { id: "香港", fullName: "香港特别行政区", d: "M758 856h42v33H758Z" },
  { id: "澳门", fullName: "澳门特别行政区", d: "M701 856h45v33H701Z" },
  { id: "贵州", fullName: "贵州省", d: "M654,709H537v79h117V709z" },
  { id: "重庆", fullName: "重庆市", d: "M565 653h89v56H565Z" },
  { id: "四川", fullName: "四川省", d: "M565,737v-84h20v-91H389v175H565z" },
  { id: "云南", fullName: "云南省", d: "M537,737H389v115h148V737z" },
  { id: "宁夏", fullName: "宁夏回族自治区", d: "M585,418h-86v96h86V418z" },
  // 已移除：台湾、曾母暗沙
  { id: "海南", fullName: "海南省", d: "M615 897h78v46H615Z" },
];

// 过滤出显示用的省份列表（去掉右侧图例矩形，保留实际省份）
const EXCLUDED_IDS = new Set(["", "曾母暗沙", "台湾"]);
export const PROVINCES = PROVINCE_PATHS.filter((p) => !EXCLUDED_IDS.has(p.id));

// ============ 文字数据（与原版完全一致的精确坐标） ============
// 注意：原版中多字省份会分行显示，如"山东"分两行
export const PROVINCE_TEXTS: ProvinceText[] = [
  { id: "内蒙古", text: "内蒙古", x: 659, y: 266, fontSize: 30 },
  { id: "黑龙江", text: "黑龙江", x: 951, y: 123, fontSize: 30 },
  { id: "吉林", text: "吉林", x: 966, y: 242, fontSize: 30 },
  { id: "辽宁", text: "辽宁", x: 906, y: 347, fontSize: 30 },
  { id: "北京", text: "北京", x: 773, y: 371, fontSize: 30 },
  { id: "天津", text: "天津", x: 773, y: 419, fontSize: 30 },
  { id: "河北", text: "河北", x: 751, y: 469, fontSize: 30 },
  { id: "山东", text: "山", x: 861, y: 488, fontSize: 30 },
  { id: "山东", text: "东", x: 861, y: 518, fontSize: 30 },
  { id: "河南", text: "河南", x: 685, y: 579, fontSize: 30 },
  { id: "湖北", text: "湖北", x: 684, y: 658, fontSize: 30 },
  { id: "湖南", text: "湖", x: 684, y: 733, fontSize: 30 },
  { id: "湖南", text: "南", x: 684, y: 763, fontSize: 30 },
  { id: "江苏", text: "江", x: 846, y: 575, fontSize: 30 },
  { id: "江苏", text: "苏", x: 846, y: 605, fontSize: 30 },
  { id: "上海", text: "上海", x: 888, y: 635, fontSize: 30 },
  { id: "浙江", text: "浙", x: 872, y: 685, fontSize: 30 },
  { id: "浙江", text: "江", x: 872, y: 715, fontSize: 30 },
  { id: "福建", text: "福", x: 844, y: 783, fontSize: 30 },
  { id: "福建", text: "建", x: 844, y: 813, fontSize: 30 },
  // 已移除：台湾
  { id: "海南", text: "海南", x: 625, y: 930, fontSize: 30 },
  { id: "广东", text: "广东", x: 721, y: 842, fontSize: 30 },
  { id: "江西", text: "江", x: 772, y: 736, fontSize: 30 },
  { id: "江西", text: "西", x: 772, y: 766, fontSize: 30 },
  { id: "安徽", text: "安", x: 793, y: 603, fontSize: 30 },
  { id: "安徽", text: "徽", x: 793, y: 633, fontSize: 30 },
  { id: "山西", text: "山", x: 674, y: 466, fontSize: 30 },
  { id: "山西", text: "西", x: 674, y: 496, fontSize: 30 },
  { id: "陕西", text: "陕", x: 604, y: 536, fontSize: 30 },
  { id: "陕西", text: "西", x: 604, y: 566, fontSize: 30 },
  { id: "宁夏", text: "宁", x: 527, y: 460, fontSize: 30 },
  { id: "宁夏", text: "夏", x: 527, y: 490, fontSize: 30 },
  { id: "甘肃", text: "甘", x: 411, y: 304, fontSize: 30 },
  { id: "甘肃", text: "肃", x: 411, y: 334, fontSize: 30 },
  { id: "青海", text: "青海", x: 301, y: 520, fontSize: 30 },
  { id: "四川", text: "四川", x: 453, y: 660, fontSize: 30 },
  { id: "云南", text: "云南", x: 432, y: 805, fontSize: 30 },
  { id: "广西", text: "广西", x: 579, y: 839, fontSize: 30 },
  { id: "贵州", text: "贵州", x: 566, y: 759, fontSize: 30 },
  { id: "重庆", text: "重庆", x: 579, y: 691, fontSize: 30 },
  { id: "西藏", text: "西藏", x: 104, y: 639, fontSize: 30 },
  { id: "新疆", text: "新疆", x: 163, y: 288, fontSize: 30 },
  { id: "香港", text: "港", x: 767, y: 880, fontSize: 24 },
  { id: "澳门", text: "澳", x: 711, y: 880, fontSize: 24 },
];

// 省份名称列表（用于下拉选择）
export const PROVINCE_NAMES = PROVINCES.map((p) => p.id).sort();

// 省份名 → 标准名 映射（用于兼容不同写法）
export const PROVINCE_NAME_MAP: Record<string, string> = {};
PROVINCES.forEach((p) => {
  PROVINCE_NAME_MAP[p.id] = p.id;
  PROVINCE_NAME_MAP[p.fullName] = p.id;
});

// 弹窗定位坐标（取第一个文字位置作为锚点）
export const PROVINCE_CENTER: Record<string, { x: number; y: number }> = {};
const seen = new Set<string>();
PROVINCE_TEXTS.forEach((t) => {
  if (!seen.has(t.id)) {
    seen.add(t.id);
    PROVINCE_CENTER[t.id] = { x: t.x, y: t.y };
  }
});
