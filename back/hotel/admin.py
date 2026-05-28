from django.contrib import admin

from .models import Booking, Favorite, Review, Room, RoomCategory


@admin.register(RoomCategory)
class RoomCategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'price_per_night', 'capacity')
    search_fields = ('title',)
    list_filter = ('capacity',)


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'room_number',
        'floor',
        'category',
        'is_available',
        'has_ac',
        'has_wifi',
    )
    search_fields = ('room_number', 'description')
    list_filter = ('floor', 'category', 'is_available', 'has_ac', 'has_wifi')


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'room',
        'check_in',
        'check_out',
        'total_price',
        'status',
        'created_at',
    )
    search_fields = ('user__username', 'room__room_number')
    list_filter = ('status', 'check_in', 'check_out')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'room', 'rating', 'created_at')
    search_fields = ('user__username', 'room__room_number', 'text')
    list_filter = ('rating', 'created_at')


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'room', 'added_at')
    search_fields = ('user__username', 'room__room_number')