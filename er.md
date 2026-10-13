```mermaid
erDiagram

    users ||--o{ albums : creates
    users ||--o{ photos : owns
    albums ||--o{ album_photos : has
    photos ||--o{ album_photos : belongs

    users {
        string id PK
        string name
        string email
        string passwordHash
        datetime created_at
        datetime updated_at
    }

    albums {
        int id PK
        string user_id FK
        string name
        datetime created_at
        datetime updated_at
    }

    photos {
        int id PK
        string user_id FK
        string url
        datetime taken_at
        string location
        decimal latitude
        decimal longitude
        SortStatus sort_status "UNSORTED(default)/SORTED"
        datetime created_at
        datetime updated_at
    }

    album_photos {
        int id PK
        int album_id FK
        int photo_id FK
        datetime created_at
        datetime updated_at
    }
```
