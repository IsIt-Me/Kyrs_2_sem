from django.db import connection


def dictfetchall(cursor):
    columns = [column[0] for column in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]


def dictfetchone(cursor):
    row = cursor.fetchone()
    if row is None:
        return None

    columns = [column[0] for column in cursor.description]
    return dict(zip(columns, row))


def get_categories():
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                id,
                title,
                description,
                price_per_night,
                capacity,
                image
            FROM hotel_roomcategory
            ORDER BY price_per_night ASC
        """)
        return dictfetchall(cursor)


def get_category_by_id(category_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT 
                id,
                title,
                description,
                price_per_night,
                capacity,
                image
            FROM hotel_roomcategory
            WHERE id = %s
        """, [category_id])
        return dictfetchone(cursor)


def get_rooms(search=None, category_id=None, available=None, page=1, page_size=6):
    base_query = """
        FROM hotel_room r
        INNER JOIN hotel_roomcategory c ON c.id = r.category_id
        WHERE 1 = 1
    """
    params = []

    if search:
        base_query += """
            AND (
                r.room_number LIKE %s
                OR r.description LIKE %s
                OR c.title LIKE %s
            )
        """
        search_value = f'%{search}%'
        params.extend([search_value, search_value, search_value])

    if category_id:
        base_query += " AND r.category_id = %s"
        params.append(category_id)

    if available is not None:
        base_query += " AND r.is_available = %s"
        params.append(available)

    count_query = f"SELECT COUNT(*) AS count {base_query}"

    select_query = f"""
        SELECT
            r.id,
            r.room_number,
            r.floor,
            r.has_ac,
            r.has_wifi,
            r.is_available,
            r.description,
            r.category_id,
            c.title AS category_title,
            c.price_per_night,
            c.capacity,
            c.image AS category_image,
            r.created_at,
            r.updated_at
        {base_query}
        ORDER BY r.floor ASC, r.room_number ASC
        LIMIT %s OFFSET %s
    """

    page = max(int(page), 1)
    page_size = max(int(page_size), 1)
    offset = (page - 1) * page_size

    with connection.cursor() as cursor:
        cursor.execute(count_query, params)
        total = dictfetchone(cursor)['count']

        cursor.execute(select_query, params + [page_size, offset])
        results = dictfetchall(cursor)

    return {
        'count': total,
        'page': page,
        'page_size': page_size,
        'total_pages': (total + page_size - 1) // page_size,
        'results': results,
    }


def get_room_by_id(room_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                r.id,
                r.room_number,
                r.floor,
                r.has_ac,
                r.has_wifi,
                r.is_available,
                r.description,
                r.category_id,
                c.title AS category_title,
                c.description AS category_description,
                c.price_per_night,
                c.capacity,
                c.image AS category_image,
                r.created_at,
                r.updated_at
            FROM hotel_room r
            INNER JOIN hotel_roomcategory c ON c.id = r.category_id
            WHERE r.id = %s
        """, [room_id])
        return dictfetchone(cursor)


def create_category(title, description, price_per_night, capacity, image=None):
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO hotel_roomcategory (
                title,
                description,
                price_per_night,
                capacity,
                image
            )
            VALUES (%s, %s, %s, %s, %s)
        """, [
            title,
            description,
            price_per_night,
            capacity,
            image,
        ])

        category_id = cursor.lastrowid

    return get_category_by_id(category_id)


def update_category(category_id, title, description, price_per_night, capacity, image=None):
    with connection.cursor() as cursor:
        cursor.execute("""
            UPDATE hotel_roomcategory
            SET
                title = %s,
                description = %s,
                price_per_night = %s,
                capacity = %s,
                image = %s
            WHERE id = %s
        """, [
            title,
            description,
            price_per_night,
            capacity,
            image,
            category_id,
        ])

        if cursor.rowcount == 0:
            return None

    return get_category_by_id(category_id)


def delete_category(category_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            DELETE FROM hotel_roomcategory
            WHERE id = %s
        """, [category_id])

        return cursor.rowcount > 0


def create_room(
    room_number,
    floor,
    has_ac,
    has_wifi,
    is_available,
    description,
    category_id,
):
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO hotel_room (
                room_number,
                floor,
                has_ac,
                has_wifi,
                is_available,
                description,
                category_id
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, [
            room_number,
            floor,
            has_ac,
            has_wifi,
            is_available,
            description,
            category_id,
        ])

        room_id = cursor.lastrowid

    return get_room_by_id(room_id)


def update_room(
    room_id,
    room_number,
    floor,
    has_ac,
    has_wifi,
    is_available,
    description,
    category_id,
):
    with connection.cursor() as cursor:
        cursor.execute("""
            UPDATE hotel_room
            SET
                room_number = %s,
                floor = %s,
                has_ac = %s,
                has_wifi = %s,
                is_available = %s,
                description = %s,
                category_id = %s
            WHERE id = %s
        """, [
            room_number,
            floor,
            has_ac,
            has_wifi,
            is_available,
            description,
            category_id,
            room_id,
        ])

        if cursor.rowcount == 0:
            return None

    return get_room_by_id(room_id)


def delete_room(room_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            DELETE FROM hotel_room
            WHERE id = %s
        """, [room_id])

        return cursor.rowcount > 0

def get_bookings(user_id=None):
    query = """
        SELECT
            b.id,
            b.check_in,
            b.check_out,
            b.total_price,
            b.status,
            b.created_at,
            b.room_id,
            r.room_number,
            b.user_id,
            u.username
        FROM hotel_booking b
        INNER JOIN hotel_room r ON r.id = b.room_id
        INNER JOIN users_user u ON u.id = b.user_id
        WHERE 1 = 1
    """
    params = []

    if user_id:
        query += " AND b.user_id = %s"
        params.append(user_id)

    query += " ORDER BY b.created_at DESC"

    with connection.cursor() as cursor:
        cursor.execute(query, params)
        return dictfetchall(cursor)


def get_booking_by_id(booking_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                b.id,
                b.check_in,
                b.check_out,
                b.total_price,
                b.status,
                b.created_at,
                b.room_id,
                r.room_number,
                b.user_id,
                u.username
            FROM hotel_booking b
            INNER JOIN hotel_room r ON r.id = b.room_id
            INNER JOIN users_user u ON u.id = b.user_id
            WHERE b.id = %s
        """, [booking_id])
        return dictfetchone(cursor)


def has_booking_conflict(room_id, check_in, check_out, exclude_booking_id=None):
    query = """
        SELECT COUNT(*) AS count
        FROM hotel_booking
        WHERE room_id = %s
          AND status = 'confirmed'
          AND check_in < %s
          AND check_out > %s
    """
    params = [room_id, check_out, check_in]

    if exclude_booking_id:
        query += " AND id <> %s"
        params.append(exclude_booking_id)

    with connection.cursor() as cursor:
        cursor.execute(query, params)
        result = dictfetchone(cursor)

    return result['count'] > 0


def calculate_booking_price(room_id, check_in, check_out):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT c.price_per_night
            FROM hotel_room r
            INNER JOIN hotel_roomcategory c ON c.id = r.category_id
            WHERE r.id = %s
        """, [room_id])
        room = dictfetchone(cursor)

    if room is None:
        return None

    nights_count = (check_out - check_in).days
    return room['price_per_night'] * nights_count


def create_booking(check_in, check_out, room_id, user_id, total_price):
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO hotel_booking (
                check_in,
                check_out,
                total_price,
                status,
                room_id,
                user_id
            )
            VALUES (%s, %s, %s, 'confirmed', %s, %s)
        """, [
            check_in,
            check_out,
            total_price,
            room_id,
            user_id,
        ])

        booking_id = cursor.lastrowid

    return get_booking_by_id(booking_id)


def cancel_booking(booking_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            UPDATE hotel_booking
            SET status = 'cancelled'
            WHERE id = %s
        """, [booking_id])

        if cursor.rowcount == 0:
            return None

    return get_booking_by_id(booking_id)


def delete_booking(booking_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            DELETE FROM hotel_booking
            WHERE id = %s
        """, [booking_id])

        return cursor.rowcount > 0


def get_reviews(room_id=None):
    query = """
        SELECT
            rv.id,
            rv.rating,
            rv.text,
            rv.created_at,
            rv.room_id,
            r.room_number,
            rv.user_id,
            u.username
        FROM hotel_review rv
        INNER JOIN hotel_room r ON r.id = rv.room_id
        INNER JOIN users_user u ON u.id = rv.user_id
        WHERE 1 = 1
    """
    params = []

    if room_id:
        query += " AND rv.room_id = %s"
        params.append(room_id)

    query += " ORDER BY rv.created_at DESC"

    with connection.cursor() as cursor:
        cursor.execute(query, params)
        return dictfetchall(cursor)


def get_review_by_id(review_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                rv.id,
                rv.rating,
                rv.text,
                rv.created_at,
                rv.room_id,
                r.room_number,
                rv.user_id,
                u.username
            FROM hotel_review rv
            INNER JOIN hotel_room r ON r.id = rv.room_id
            INNER JOIN users_user u ON u.id = rv.user_id
            WHERE rv.id = %s
        """, [review_id])
        return dictfetchone(cursor)


def create_review(room_id, user_id, rating, text):
    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO hotel_review (
                rating,
                text,
                room_id,
                user_id
            )
            VALUES (%s, %s, %s, %s)
        """, [
            rating,
            text,
            room_id,
            user_id,
        ])

        review_id = cursor.lastrowid

    return get_review_by_id(review_id)


def update_review(review_id, rating, text):
    with connection.cursor() as cursor:
        cursor.execute("""
            UPDATE hotel_review
            SET
                rating = %s,
                text = %s
            WHERE id = %s
        """, [
            rating,
            text,
            review_id,
        ])

        if cursor.rowcount == 0:
            return None

    return get_review_by_id(review_id)


def delete_review(review_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            DELETE FROM hotel_review
            WHERE id = %s
        """, [review_id])

        return cursor.rowcount > 0


def get_favorites(user_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                f.id,
                f.added_at,
                f.room_id,
                r.room_number,
                r.floor,
                r.description,
                r.is_available,
                c.title AS category_title,
                c.price_per_night,
                c.capacity,
                f.user_id,
                u.username
            FROM hotel_favorite f
            INNER JOIN hotel_room r ON r.id = f.room_id
            INNER JOIN hotel_roomcategory c ON c.id = r.category_id
            INNER JOIN users_user u ON u.id = f.user_id
            WHERE f.user_id = %s
            ORDER BY f.added_at DESC
        """, [user_id])
        return dictfetchall(cursor)


def get_favorite_by_id(favorite_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                f.id,
                f.added_at,
                f.room_id,
                r.room_number,
                r.floor,
                r.description,
                r.is_available,
                c.title AS category_title,
                c.price_per_night,
                c.capacity,
                f.user_id,
                u.username
            FROM hotel_favorite f
            INNER JOIN hotel_room r ON r.id = f.room_id
            INNER JOIN hotel_roomcategory c ON c.id = r.category_id
            INNER JOIN users_user u ON u.id = f.user_id
            WHERE f.id = %s
        """, [favorite_id])
        return dictfetchone(cursor)


def get_favorite_by_user_and_room(user_id, room_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                id,
                added_at,
                room_id,
                user_id
            FROM hotel_favorite
            WHERE user_id = %s AND room_id = %s
        """, [user_id, room_id])
        return dictfetchone(cursor)


def create_favorite(user_id, room_id):
    existing = get_favorite_by_user_and_room(user_id, room_id)

    if existing is not None:
        return get_favorite_by_id(existing['id'])

    with connection.cursor() as cursor:
        cursor.execute("""
            INSERT INTO hotel_favorite (
                user_id,
                room_id
            )
            VALUES (%s, %s)
        """, [
            user_id,
            room_id,
        ])

        favorite_id = cursor.lastrowid

    return get_favorite_by_id(favorite_id)


def delete_favorite(favorite_id):
    with connection.cursor() as cursor:
        cursor.execute("""
            DELETE FROM hotel_favorite
            WHERE id = %s
        """, [favorite_id])

        return cursor.rowcount > 0