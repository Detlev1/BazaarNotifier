import axios from "axios"

const toTitleCase = (str) => str.replace(/\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());

const convertItemName = (item) => {
  let filtered = item;
  let romanConversion = "";

  if (item.startsWith("ENCHANTMENT")) {
    let enchantNumber = parseInt(item.split("_").pop());

    // Since it only goes 1-10, might as well hard code the list
    romanConversion = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII",
      "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII",
      "XIX", "XX"][enchantNumber];

    filtered = filtered.split("_").slice(0, -1).join("_");

  }

  if (item.startsWith("ENCHANTMENT_ULTIMATE_WISE") || item.startsWith(
      "ENCHANTMENT_ULTIMATE_JERRY")) {
    filtered = filtered.replace("ENCHANTMENT_", "");
  } else if (item.startsWith("ENCHANTMENT_ULTIMATE")) {
    filtered = filtered.replace("ENCHANTMENT_ULTIMATE_", "");
  } else if (item.startsWith("ENCHANTMENT")) {
    filtered = filtered.replace("ENCHANTMENT_", "");
  } else if (item.startsWith("ESSENCE")) {
    filtered = filtered.replace("ESSENCE_", "") + "_ESSENCE";
  } else if (item.endsWith("SCROLL")) {
    filtered = filtered.replace("_SCROLL", "");
  } else if (item === "SIL_EX") {
    filtered = "SILEX";
  }

  filtered = toTitleCase(filtered.replace(/_/g, " "));
  filtered = filtered
  .replace(" For ", " for ")
  .replace(" Of ", " of ")
  .replace(" The ", " the ");

  if (item === "ENCHANTMENT_ULTIMATE_ONE_FOR_ALL_1") {
    filtered = filtered.replace(" for ", " For ");
  }

  if (item.startsWith("ENCHANTMENT")) {
    filtered += " " + romanConversion;
  }

  return filtered;
}

const convertName = (name) => {
  if (name.match(/^ENCHANTMENT_(ULTIMATE_)?(.*)_(\d+)$/)) {
    return name.replace(/^ENCHANTMENT_(ULTIMATE_)?(.*)_(\d+)$/, "$1$2;$3");
  }

  if (name === "INK_SACK:3") name = "INK_SACK-3";
  else if (name === "BAZAAR_COOKIE") name = "BOOSTER_COOKIE"
  else if (name.includes(":")) name = name.replace(":", "-")


  return name;
}

const removeColorCode = (str) => {
  let current = str;
  while (current.includes('§')){
    const index = current.indexOf('§');
    current = current.slice(0, index) + current.slice(index + 2);
  }
  return current;
};

export default {
  update: async (resources, log = false) => {
    let bazaarData = (await axios.get(
        "https://api.hypixel.net/skyblock/bazaar")).data.products;
    let newItems = {}

    let currentItemList = Object.keys(bazaarData)
    let flaggedItem = {};

    for (let item of currentItemList) {
      if (!Object.keys(resources.bazaarConversions).includes(item)) {
        newItems[item] = convertItemName(item)
      } else {
        flaggedItem[item] = true;
      }
    }

    for (let item of Object.keys(newItems)) {
      flaggedItem[item] = true;
      resources.bazaarConversions[item] = newItems[item];
    }

    if (log) {
      if (Object.keys(flaggedItem).length === 0) {
        console.log("[BNRUS] No changed items.")
      } else if (Object.keys(newItems).length === 0) {
        console.log("[BNRUS] No new items.");
      } else {
        console.log(JSON.stringify(newItems, null, 2))
      }
      for (let item of Object.keys(resources.bazaarConversions)) {
        if (!(item in flaggedItem)) {
          console.log(item);
        }
      }
    }
  },


  full_check: async (resources, access_token,  log=false) => {
    if(access_token !== ""){
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
    }
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    if(log){
      console.log("starting complete item name check")
    }
    let bazaarData = (await axios.get(
      "https://api.hypixel.net/skyblock/bazaar")).data.products;

    let keys = Object.keys(bazaarData);
    for (let name of keys){
      if (name === "ENCHANTED_CARROT_ON_A_STICK" || name === "BAZAAR_COOKIE" || name.startsWith("ENCHANTMENT")){
        continue;
      }
      let template = `https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/master/items/${convertName(name)}.json`
      if(access_token === ""){
        await delay(50);
      }
      let itemName = String((await axios.get(
         template)).data.displayname);
      itemName = removeColorCode(itemName)
      if(resources.bazaarConversions[name] != itemName){
        if(log){
          console.log("-------------------------")
          console.log("Changed existing item name from " + resources.bazaarConversions[name] + " to " + itemName)
          console.log("-------------------------")
        }
        resources.bazaarConversions[name] = itemName
      }
    }
  }
}