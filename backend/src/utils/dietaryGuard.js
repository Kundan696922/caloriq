/**
 * Server-side allergen / diet / excluded-food guard.
 *
 * Safety rules must not depend on the AI obeying its prompt, so every generated
 * meal is keyword-checked here. The guard errs on the SAFE side: it may reject
 * a harmless meal (e.g. "butter beans" for a dairy allergy is handled, but
 * unusual wording may slip through as a false positive) but it should never
 * let an obvious allergen through.
 *
 * LIMITATION: keyword matching cannot catch hidden ingredients (e.g. a
 * "sauce" that contains soy). Users with severe allergies must always read
 * the ingredient list themselves.
 */

const DAIRY_IGNORE =
  /\b(?:coconut|almond|soy|soya|oat|rice|cashew|hazelnut)\s+(?:milk|cream|yogurt|yoghurt|cheese|butter)\b|\bpeanut butter\b|\bnut butter\b|\bcocoa butter\b|\bcoconut (?:cream|butter)\b|\bbutter\s?beans?\b/gi;

const GLUTEN_IGNORE =
  /\b(?:rice|corn|chickpea|almond|coconut|buckwheat|tapioca|potato|gram|besan|lentil|quinoa|gluten[- ]free)\s+(?:flour|pasta|noodles?|bread|tortillas?|wraps?|crackers?)\b|\bcorn tortillas?\b|\btamari\b/gi;

const CATEGORY_DEFS = {
  peanut: { label: "peanuts", keywords: ["peanut", "groundnut"] },
  tree_nut: {
    label: "tree nuts",
    keywords: [
      "almond",
      "walnut",
      "cashew",
      "pecan",
      "pistachio",
      "hazelnut",
      "macadamia",
      "brazil nut",
      "pine nut",
    ],
  },
  dairy: {
    label: "dairy",
    keywords: [
      "milk",
      "cheese",
      "butter",
      "cream",
      "yogurt",
      "yoghurt",
      "whey",
      "casein",
      "ghee",
      "paneer",
      "curd",
      "ice cream",
      "custard",
    ],
    ignore: DAIRY_IGNORE,
  },
  egg: { label: "eggs", keywords: ["egg", "mayonnaise", "mayo", "albumen"] },
  gluten: {
    label: "gluten",
    keywords: [
      "wheat",
      "flour",
      "bread",
      "pasta",
      "spaghetti",
      "macaroni",
      "barley",
      "rye",
      "couscous",
      "semolina",
      "seitan",
      "noodle",
      "roti",
      "chapati",
      "naan",
      "bulgur",
      "farro",
      "cracker",
      "tortilla",
      "pita",
      "panko",
      "soy sauce",
    ],
    ignore: GLUTEN_IGNORE,
  },
  soy: {
    label: "soy",
    keywords: ["soy", "soya", "tofu", "tempeh", "edamame", "miso", "tamari"],
  },
  fish: {
    label: "fish",
    keywords: [
      "fish",
      "salmon",
      "tuna",
      "cod",
      "tilapia",
      "sardine",
      "anchovy",
      "trout",
      "mackerel",
      "haddock",
      "pollock",
      "catfish",
      "hilsa",
      "rohu",
      "basa",
    ],
  },
  shellfish: {
    label: "shellfish",
    keywords: [
      "shrimp",
      "prawn",
      "crab",
      "lobster",
      "crayfish",
      "clam",
      "mussel",
      "oyster",
      "scallop",
      "squid",
      "calamari",
    ],
  },
  sesame: { label: "sesame", keywords: ["sesame", "tahini"] },
  meat: {
    label: "meat",
    keywords: [
      "chicken",
      "beef",
      "pork",
      "lamb",
      "mutton",
      "turkey",
      "bacon",
      "ham",
      "sausage",
      "steak",
      "duck",
      "veal",
      "goat",
      "salami",
      "pepperoni",
      "mince",
      "gelatin",
    ],
  },
  honey: { label: "honey", keywords: ["honey"] },
  non_halal: {
    label: "non-halal items",
    keywords: [
      "pork",
      "bacon",
      "ham",
      "lard",
      "gelatin",
      "wine",
      "beer",
      "rum",
      "vodka",
      "whiskey",
      "alcohol",
    ],
  },
};

// Free-text allergy terms -> categories. Unknown terms are matched literally.
const ALLERGY_ALIASES = {
  peanut: ["peanut"],
  peanuts: ["peanut"],
  "tree nut": ["tree_nut"],
  "tree nuts": ["tree_nut"],
  nut: ["peanut", "tree_nut"],
  nuts: ["peanut", "tree_nut"],
  dairy: ["dairy"],
  milk: ["dairy"],
  lactose: ["dairy"],
  egg: ["egg"],
  eggs: ["egg"],
  gluten: ["gluten"],
  wheat: ["gluten"],
  soy: ["soy"],
  soya: ["soy"],
  fish: ["fish"],
  shellfish: ["shellfish"],
  seafood: ["fish", "shellfish"],
  sesame: ["sesame"],
};

const DIET_CATEGORIES = {
  vegetarian: ["meat", "fish", "shellfish"],
  vegan: ["meat", "fish", "shellfish", "dairy", "egg", "honey"],
  pescatarian: ["meat"],
  gluten_free: ["gluten"],
  dairy_free: ["dairy"],
  halal: ["non_halal"],
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Whole-word match, tolerating simple plurals ("egg" -> "eggs", "peach" is not "each").
function keywordRegex(keywords) {
  const body = keywords.map(escapeRegex).join("|");
  return new RegExp(`\\b(?:${body})(?:e?s)?\\b`, "i");
}

function normalizeTerm(term) {
  return String(term).toLowerCase().replace(/\s+/g, " ").trim();
}

function categoryRule(categoryKey, labelPrefix, scope) {
  const def = CATEGORY_DEFS[categoryKey];
  return {
    label: `${labelPrefix}: ${def.label}`,
    regex: keywordRegex(def.keywords),
    ignore: def.ignore,
    scope,
  };
}

/**
 * Builds the list of rules for a generation request.
 * scope "all" = scanned against title, description, ingredients, instructions.
 * scope "ingredients" = ingredient names and title only.
 */
function buildDietaryRules({
  allergies = [],
  dietaryPreferences = [],
  excludedFoods = [],
} = {}) {
  const rules = [];
  const seen = new Set();
  const add = (rule) => {
    if (seen.has(rule.label)) return;
    seen.add(rule.label);
    rules.push(rule);
  };

  allergies.forEach((raw) => {
    const term = normalizeTerm(raw);
    if (!term) return;
    const categories = ALLERGY_ALIASES[term];
    if (categories) {
      categories.forEach((c) => add(categoryRule(c, "allergy", "all")));
    } else {
      add({
        label: `allergy: ${term}`,
        regex: keywordRegex([term]),
        scope: "all",
      });
    }
  });

  dietaryPreferences.forEach((pref) => {
    (DIET_CATEGORIES[pref] || []).forEach((c) =>
      add(categoryRule(c, `diet (${pref.replace("_", " ")})`, "all")),
    );
  });

  excludedFoods.forEach((raw) => {
    const term = normalizeTerm(raw);
    if (!term) return;
    add({
      label: `excluded food: ${term}`,
      regex: keywordRegex([term]),
      scope: "ingredients",
    });
  });

  return rules;
}

// "gluten-free", "dairy free" etc. describe absence, so they must not trigger the rule.
function prepareText(text) {
  return String(text)
    .toLowerCase()
    .replace(/\b[a-z]+[-\s]free\b/g, " ");
}

/**
 * Returns the labels of every rule the meal violates (empty array = clean).
 * @param meal { title, description, ingredients: [{name, searchTerm}], instructions: [] }
 */
function checkMeal(meal, rules) {
  if (!rules || rules.length === 0) return [];

  const ingredientText = meal.ingredients
    .map((i) => `${i.name} ; ${i.searchTerm || ""}`)
    .join(" ; ");

  const texts = {
    ingredients: prepareText(`${meal.title} ; ${ingredientText}`),
    all: prepareText(
      [
        meal.title,
        meal.description,
        ingredientText,
        (meal.instructions || []).join(" ; "),
      ].join(" ; "),
    ),
  };

  const violations = [];
  rules.forEach((rule) => {
    const source = texts[rule.scope] ?? texts.all;
    const cleaned = rule.ignore ? source.replace(rule.ignore, " ") : source;
    if (rule.regex.test(cleaned)) violations.push(rule.label);
  });

  return [...new Set(violations)];
}

module.exports = { buildDietaryRules, checkMeal };
