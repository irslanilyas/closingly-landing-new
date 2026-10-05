export const COUNTRY_CODES =
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(
    " ",
  );

/**
 * A time zone says where someone is far more reliably than their browser
 * language (most browsers everywhere default to en-US).
 */
export const ZONE_COUNTRY: Record<string, string> = {
  "Asia/Karachi": "PK", "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Asia/Dhaka": "BD", "Asia/Colombo": "LK",
  "Asia/Kathmandu": "NP", "Asia/Dubai": "AE", "Asia/Riyadh": "SA", "Asia/Qatar": "QA", "Asia/Bahrain": "BH",
  "Asia/Kuwait": "KW", "Asia/Muscat": "OM", "Asia/Jerusalem": "IL", "Asia/Amman": "JO", "Asia/Beirut": "LB",
  "Asia/Baghdad": "IQ", "Asia/Tehran": "IR", "Asia/Kabul": "AF", "Asia/Tashkent": "UZ", "Asia/Almaty": "KZ",
  "Asia/Singapore": "SG", "Asia/Kuala_Lumpur": "MY", "Asia/Jakarta": "ID", "Asia/Manila": "PH", "Asia/Bangkok": "TH",
  "Asia/Ho_Chi_Minh": "VN", "Asia/Saigon": "VN", "Asia/Hong_Kong": "HK", "Asia/Shanghai": "CN", "Asia/Taipei": "TW",
  "Asia/Seoul": "KR", "Asia/Tokyo": "JP", "Europe/London": "GB", "Europe/Dublin": "IE", "Europe/Lisbon": "PT",
  "Europe/Madrid": "ES", "Europe/Paris": "FR", "Europe/Brussels": "BE", "Europe/Amsterdam": "NL",
  "Europe/Luxembourg": "LU", "Europe/Berlin": "DE", "Europe/Zurich": "CH", "Europe/Vienna": "AT", "Europe/Rome": "IT",
  "Europe/Copenhagen": "DK", "Europe/Oslo": "NO", "Europe/Stockholm": "SE", "Europe/Helsinki": "FI",
  "Europe/Warsaw": "PL", "Europe/Prague": "CZ", "Europe/Budapest": "HU", "Europe/Bucharest": "RO",
  "Europe/Sofia": "BG", "Europe/Athens": "GR", "Europe/Belgrade": "RS", "Europe/Zagreb": "HR", "Europe/Kiev": "UA",
  "Europe/Kyiv": "UA", "Europe/Istanbul": "TR", "Europe/Moscow": "RU", "Europe/Tallinn": "EE", "Europe/Riga": "LV",
  "Europe/Vilnius": "LT", "Africa/Cairo": "EG", "Africa/Lagos": "NG", "Africa/Nairobi": "KE",
  "Africa/Johannesburg": "ZA", "Africa/Casablanca": "MA", "Africa/Accra": "GH", "Africa/Tunis": "TN",
  "Africa/Algiers": "DZ", "America/New_York": "US", "America/Detroit": "US", "America/Chicago": "US",
  "America/Denver": "US", "America/Phoenix": "US", "America/Los_Angeles": "US", "America/Anchorage": "US",
  "Pacific/Honolulu": "US", "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA",
  "America/Winnipeg": "CA", "America/Halifax": "CA", "America/Mexico_City": "MX", "America/Bogota": "CO",
  "America/Lima": "PE", "America/Santiago": "CL", "America/Argentina/Buenos_Aires": "AR",
  "America/Buenos_Aires": "AR", "America/Sao_Paulo": "BR", "America/Caracas": "VE", "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU", "Australia/Brisbane": "AU", "Australia/Perth": "AU", "Australia/Adelaide": "AU",
  "Pacific/Auckland": "NZ",
};

export const ROLES = [
  { value: "freelancer", label: "Freelancer" },
  { value: "consultant", label: "Consultant or coach" },
  { value: "agency", label: "Agency or studio" },
  { value: "founder", label: "Founder" },
  { value: "other", label: "Other" },
] as const;

export const CALLS = [
  { value: "1-5", label: "1–5" },
  { value: "6-15", label: "6–15" },
  { value: "16-30", label: "16–30" },
  { value: "30+", label: "30+" },
] as const;
