package dev.meyi.bn.utilities;

import java.lang.reflect.Field;
import net.minecraft.client.gui.inventory.GuiChest;
import net.minecraft.inventory.IInventory;

public class ReflectionHelper {
  private static Field lowerChestInventory;
  public static void setup() {
    try {
      lowerChestInventory = GuiChest.class.getDeclaredField("field_147015_w");
      lowerChestInventory.setAccessible(true);
    } catch (NoSuchFieldException e) {
      try{
        lowerChestInventory = GuiChest.class.getDeclaredField("lowerChestInventory");
        lowerChestInventory.setAccessible(true);
        System.out.println(lowerChestInventory);
      }catch (NoSuchFieldException ignored){
        lowerChestInventory = null;
        System.out.println("Set to null");
        e.printStackTrace();
      }
    }
  }

  public static IInventory getLowerChestInventory(GuiChest g) {
    try {
      if (lowerChestInventory != null) {
        return (IInventory)lowerChestInventory.get(g);
      }
      System.out.println("null");
    } catch (IllegalAccessException ignored) {
      System.out.println("Illegal access");
    }
    return null;
  }
}
