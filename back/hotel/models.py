from django.conf import settings
from django.db import models


class RoomCategory(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField()
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    capacity = models.IntegerField(default=2)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)

    class Meta:
        db_table = 'hotel_roomcategory'
        managed = False
        verbose_name = 'Категория номера'
        verbose_name_plural = 'Категории номеров'

    def __str__(self):
        return self.title


class Room(models.Model):
    room_number = models.CharField(max_length=10, unique=True)
    floor = models.IntegerField(default=1)
    has_ac = models.BooleanField(default=True)
    has_wifi = models.BooleanField(default=True)
    is_available = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(
        RoomCategory,
        on_delete=models.RESTRICT,
        db_column='category_id',
        related_name='rooms',
    )
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        db_table = 'hotel_room'
        managed = False
        verbose_name = 'Номер'
        verbose_name_plural = 'Номера'

    def __str__(self):
        return f'Номер {self.room_number}'


class Booking(models.Model):
    STATUS_CONFIRMED = 'confirmed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_COMPLETED = 'completed'

    STATUS_CHOICES = (
        (STATUS_CONFIRMED, 'Подтверждено'),
        (STATUS_CANCELLED, 'Отменено'),
        (STATUS_COMPLETED, 'Завершено'),
    )

    check_in = models.DateField()
    check_out = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_CONFIRMED)
    created_at = models.DateTimeField()
    room = models.ForeignKey(
        Room,
        on_delete=models.RESTRICT,
        db_column='room_id',
        related_name='bookings',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='user_id',
        related_name='bookings',
    )

    class Meta:
        db_table = 'hotel_booking'
        managed = False
        verbose_name = 'Бронирование'
        verbose_name_plural = 'Бронирования'

    def __str__(self):
        return f'{self.room} с {self.check_in} по {self.check_out}'


class Review(models.Model):
    rating = models.IntegerField()
    text = models.TextField()
    created_at = models.DateTimeField()
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        db_column='room_id',
        related_name='reviews',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='user_id',
        related_name='reviews',
    )

    class Meta:
        db_table = 'hotel_review'
        managed = False
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'

    def __str__(self):
        return f'Отзыв {self.rating}/5'


class Favorite(models.Model):
    added_at = models.DateTimeField()
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        db_column='room_id',
        related_name='favorites',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='user_id',
        related_name='favorites',
    )

    class Meta:
        db_table = 'hotel_favorite'
        managed = False
        unique_together = ('user', 'room')
        verbose_name = 'Избранное'
        verbose_name_plural = 'Избранное'

    def __str__(self):
        return f'{self.user} -> {self.room}'