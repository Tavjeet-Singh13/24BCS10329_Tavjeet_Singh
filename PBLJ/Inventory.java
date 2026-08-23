// Inventory Reordering System
// You are building a simplified inventory management program for a warehouse.
// Problem Statement
// Create a program that tracks stock levels across multiple warehouse sections using a 2D ArrayList and processes reorder requests using a LinkedList.
// Initialize Warehouse Inventory (2D ArrayList):
// Create a 2D ArrayList of integers (ArrayList<ArrayList<Integer>>) representing 3 sections of a warehouse.
// Populate each section with the current stock counts of 3 products:
// Section 0: [5, 12, 3]
// Section 1: [8, 2, 15]
// Section 2: [1, 20, 4]
// Process Low-Stock Items (LinkedList Logic):
// Create a single LinkedList of Integers to store critical stock alerts.
// Iterate through the 2D ArrayList. If any product's stock count is less than 5:
// Add that stock count to the LinkedList.
// Apply Logic: Double the value of every element added to the LinkedList to represent the new target stock count needed for reordering.
// Output:
// Print the original warehouse inventory section by section.
// Print the processed LinkedList showing the target reorder quantities.

// Test Case 1: Standard Multi-Section Warehouse
// Verifies standard threshold filtering and value doubling across multiple sections.
// Input Inventory (2D ArrayList):
// Section 0: [10, 3, 7]
// Section 1: [1, 15, 2]
// Section 2: [4, 5, 0]
// Expected Output LinkedList: [6, 2, 4, 8, 0]


import java.util.*;

public class Inventory {
    public static void main(String[] args)
    {

        ArrayList<ArrayList<Integer>> inventory = new ArrayList<>();
        inventory.add(new ArrayList<>(Arrays.asList(10, 3, 7)));
        inventory.add(new ArrayList<>(Arrays.asList(1, 15, 2)));
        inventory.add(new ArrayList<>(Arrays.asList(4, 5, 0)));

        LinkedList<Integer> result = new LinkedList<>();

        for(ArrayList<Integer> i : inventory)
        {
            for(Integer j : i)
            {
                if(j < 5)
                {
                    result.add(j * 2);
                }
            }
        }
        System.out.println(result);
    }
}
