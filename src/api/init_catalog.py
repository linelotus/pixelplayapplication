# 🎮 Initialize Item Catalog
# Run this once to populate the item catalog

from api.models import db, ItemCatalog
from flask import current_app

def init_catalog():
    """Initialize item catalog with default items"""
    
    # Check if already populated
    if ItemCatalog.query.count() > 0:
        print(f"✅ Catalog already has {ItemCatalog.query.count()} items")
        return
    
    print("📦 Populating item catalog...")
    
    default_items = [
        # Avataaars defaults (free)
        {'avatar_style': 'avataaars', 'item_category': 'topType', 
         'item_value': 'ShortHairShortFlat', 'item_name': 'Short Flat Hair',
         'is_default': True, 'unlock_level': 1, 'unlock_cost': 0, 'rarity': 'common'},
        
        {'avatar_style': 'avataaars', 'item_category': 'topType',
         'item_value': 'LongHairStraight', 'item_name': 'Long Straight Hair',
         'is_default': True, 'unlock_level': 1, 'unlock_cost': 0, 'rarity': 'common'},
        
        {'avatar_style': 'avataaars', 'item_category': 'hairColor',
         'item_value': 'Brown', 'item_name': 'Brown Hair',
         'is_default': True, 'unlock_level': 1, 'unlock_cost': 0, 'rarity': 'common'},
        
        {'avatar_style': 'avataaars', 'item_category': 'skinColor',
         'item_value': 'Light', 'item_name': 'Light Skin',
         'is_default': True, 'unlock_level': 1, 'unlock_cost': 0, 'rarity': 'common'},
        
        {'avatar_style': 'avataaars', 'item_category': 'clothesType',
         'item_value': 'Hoodie', 'item_name': 'Hoodie',
         'is_default': True, 'unlock_level': 1, 'unlock_cost': 0, 'rarity': 'common'},
        
        # Unlockable items
        {'avatar_style': 'avataaars', 'item_category': 'topType',
         'item_value': 'LongHairCurly', 'item_name': 'Curly Hair',
         'is_default': False, 'unlock_level': 3, 'unlock_cost': 50, 'rarity': 'rare'},
        
        {'avatar_style': 'avataaars', 'item_category': 'accessoriesType',
         'item_value': 'Sunglasses', 'item_name': 'Sunglasses',
         'is_default': False, 'unlock_level': 4, 'unlock_cost': 100, 'rarity': 'epic'},
    ]
    
    for item_data in default_items:
        item = ItemCatalog(**item_data)
        db.session.add(item)
    
    db.session.commit()
    print(f"✅ Added {len(default_items)} items to catalog!")

if __name__ == '__main__':
    from app import app
    with app.app_context():
        init_catalog()