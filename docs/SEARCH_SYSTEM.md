# Search System

## Architecture

The search system provides restaurant and menu item discovery across the platform. It supports filtering, sorting, pagination, and autocomplete suggestions.

## Module Structure

**Backend:**
- `apps/backend/src/services/search/search.module.ts` - Search module
- `apps/backend/src/services/search/search.controller.ts` - REST API endpoints
- `apps/backend/src/services/search/search.service.ts` - Search business logic

**Database:**
- PostgreSQL primary (via TypeORM)
- MongoDB for flexible schema (reviews schema exists)

## Search Endpoints

**File:** `apps/backend/src/services/search/search.controller.ts`

### Restaurant Search

```
GET /search/restaurants
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query |
| `cuisine` | string | Filter by cuisine type |
| `rating` | number | Minimum rating filter |
| `lat` | number | Customer latitude |
| `lng` | number | Customer longitude |
| `sort` | string | `distance`, `rating`, `delivery_time` |
| `page` | number | Page number |
| `limit` | number | Results per page |

**Response:**
```json
{
  "restaurants": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "address": "string",
      "rating": 4.5,
      "deliveryTime": 30,
      "cuisineType": "string",
      "isActive": true
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

### Menu Search

```
GET /search/menu
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query |
| `restaurantId` | string | Filter by restaurant |
| `category` | string | Filter by category |
| `veg` | boolean | Veg/non-veg filter |
| `maxPrice` | number | Price ceiling |
| `page` | number | Page number |
| `limit` | number | Results per page |

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "price": 199.00,
      "imageUrl": "string",
      "isVeg": true,
      "spiceLevel": 2,
      "rating": 4.5
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

### Search Suggestions (Autocomplete)

```
GET /search/suggestions
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Partial search query |
| `limit` | number | Max suggestions |

**Response:**
```json
{
  "suggestions": [
    { "type": "restaurant", "name": "Spice Garden", "id": "uuid" },
    { "type": "menu_item", "name": "Butter Chicken", "id": "uuid" }
  ]
}
```

### Popular/Trending

```
GET /search/popular
```

Returns:
- Trending restaurants
- Top dishes
- Popular categories

## Frontend Search

### Customer Web

**File:** `apps/customer-web/src/pages/search.tsx`

Features:
- Search bar with debounce
- Filter tabs (All, Popular, Offers, Nearby, Rated 4+)
- Offline search queue
- Restaurant cards with ratings
- Category quick filters (Burgers, Pizza, Drinks, Dessert, Healthy)

**State Management:**
- `useReducer` for search state
- TanStack Query for data fetching
- `useOfflineQueue` for offline resilience

### Customer Mobile

**File:** `apps/customer-mobile/src/screens/SearchScreen.tsx`

Features:
- Search input
- Restaurant list
- Category filters
- Location-based ordering

## Search Schema (MongoDB)

**File:** `apps/backend/src/db/schemas/review.schema.ts` (related)

Search uses PostgreSQL with TypeORM. No dedicated search index/schema file found - likely using SQL LIKE/ILIKE queries or PostgreSQL full-text search.

## Search Indexes

**Implicit indexes via TypeORM:**
- `restaurants.name` - For name search
- `restaurants.cuisine_type` - For cuisine filter
- `menu_items.name` - For item search
- `menu_items.category_id` - For category filter

## Performance Considerations

- Pagination implemented (page + limit)
- Filtering at database level
- No dedicated search engine (Elasticsearch/OpenSearch) - uses PostgreSQL

## Known Limitations

1. **No full-text search engine** - Uses PostgreSQL LIKE/ILIKE or basic matching
2. **No fuzzy matching** - Exact substring matching only
3. **No synonym support** - "biryani" won't match "biryani rice"
4. **No relevance scoring** - Results ordered by match or configured sort only
