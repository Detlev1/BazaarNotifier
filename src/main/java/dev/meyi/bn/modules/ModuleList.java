package dev.meyi.bn.modules;

import dev.meyi.bn.BazaarNotifier;
import dev.meyi.bn.handlers.MouseHandler;
import dev.meyi.bn.utilities.EnchantedCraftingHandler;
import dev.meyi.bn.utilities.Suggester;
import dev.meyi.bn.utilities.Utils;
import java.util.ArrayList;

import org.json.JSONArray;
import org.json.JSONObject;
import org.lwjgl.input.Keyboard;
import org.lwjgl.input.Mouse;

public class ModuleList extends ArrayList<Module> {

  Module movingModule = null;

  public ModuleList() {
    this(Utils.initializeConfig());
  }

  public ModuleList(JSONObject config) {
    BazaarNotifier.apiKey = config.getString("api");
    JSONObject workingConfig;
    if (!config.getString("version").equalsIgnoreCase(BazaarNotifier.VERSION)) {
      workingConfig = Utils.initializeConfig();
    } else {
      workingConfig = config;
    }

    JSONArray modules = workingConfig.getJSONArray("modules");

    for (Object m : modules) {
      JSONObject module = (JSONObject) m;
      switch (ModuleName.valueOf(module.getString("name"))) {
        case SUGGESTION:
          add(new SuggestionModule(module));
          break;
        case BANK:
          add(new BankModule(module));
          break;
        case NOTIFICATION:
          add(new NotificationModule(module));
          break;
        case CRAFTING:
          add(new CraftingModule(module));
          break;
        default:
          throw new IllegalStateException(
              "Unexpected value: " + ModuleName.valueOf(module.getString("name")));
      }
    }
  }

  public void drawAllModules() {
    for (Module m : this) {
      m.draw();
    }
  }

  public void drawAllOutlines() {
    for (Module m : this) {
      m.drawBounds();
    }
  }
  public void rescaleCheck(){
    for (Module m: this){
      if(m.inMovementBox() && Keyboard.isKeyDown(29)&& !Keyboard.isKeyDown(42)){
        float newScale = m.scale + (float)MouseHandler.mouseWheelMovement / 10;
        m.scale = Math.max(newScale, 0.1f);
      }
    }
  }

  public void movementCheck() {
    if (Mouse.isButtonDown(0)) {
      if (movingModule == null) {
        for (Module m : this) {
          if (m.inMovementBox()) {
            m.needsToMove = true;
          }
        }
        for (Module m : this) {
          if (movingModule != null) {
            m.needsToMove = false;
          } else if (m.needsToMove) {
            movingModule = m;
          }
        }
      }
      if (movingModule != null) {
        movingModule.handleMovement();
      }
    } else {
      if (movingModule != null) {
        movingModule.needsToMove = false;
        movingModule.moving = false;
      }
      movingModule = null;
    }
  }

  public void pageFlipCheck() {
    if(!Keyboard.isKeyDown(29) && !Keyboard.isKeyDown(42)) {
      if (MouseHandler.mouseWheelMovement != 0) {
        for (Module m : this) {
          if (m.inMovementBox() && m.getMaxShift() > 0) {
          /*if (dWheel < 0){  //this should be compatible with every Mouse if there are problems. m.getDWheel returns different values depending on the Mouse
            if(m.getMaxShift() > m.shift) {
              m.shift++;
            }
          }else {
            if (m.shift > 0) {
              m.shift--;
            }
           }
           */
            m.shift += MouseHandler.mouseWheelMovement;
            if (m.shift > m.getMaxShift()) {
              m.shift = m.getMaxShift();
            } else if (m.shift < 0) {
              m.shift = 0;
            }

            break;
          }
        }
      }
    }
  }


  public void resetAll() {
    for (Module m : this) {
      m.reset();
    }
  }

  public void resetScale(){
    for(Module m : this){
      m.scale = 1;
    }
  }

  public JSONObject generateConfig() {
    JSONObject o = new JSONObject().put("api", BazaarNotifier.apiKey)
            .put("version", BazaarNotifier.VERSION)
            .put("craftingListLength", EnchantedCraftingHandler.craftingListLength)
            .put("suggestionListLength" , Suggester.suggestionListLength)
            .put("CRAFTING_SORTING_OPTION", EnchantedCraftingHandler.craftingSortingOption)
            .put("showInstasellProfit", EnchantedCraftingHandler.showInstasellProfit)
            .put("showSellofferProfit", EnchantedCraftingHandler.showSellofferProfit)
            .put("showProfitPerMil", EnchantedCraftingHandler.showProfitPerMil)
            .put("collectionChecking", EnchantedCraftingHandler.collectionCheckDisabled);

    JSONArray modules = new JSONArray();
    for (Module m : this) {
      modules.put(m.generateModuleConfig());
    }
    return o.put("modules", modules);
  }
}
