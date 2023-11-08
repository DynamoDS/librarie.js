
// Test data to create LibraryItem  
export const createLibraryItem = (ItemData: any) => {

    // Parent item that will hold the child items
    let data = new ItemData("");
    data.text = "TestItem";
    data.itemType = "none";
    
    // Create child items and link with parent
    for (let i = 0; i < 2; i++) {
      let item = new ItemData("");
      item.text = "Child" + i;
      item.itemType = "category";
      data.appendChild(item);
    }
    return data;
  }

  