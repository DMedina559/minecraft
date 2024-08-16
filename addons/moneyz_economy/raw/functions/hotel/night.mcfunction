execute as @initiator[tag=!hotelown] run tell @s §cYou're not the Hotel Ownwer

execute as @initiator[tag=hotelown] run scoreboard players remove @a[tag=hotel] Moneyz 15

execute as @initiator[tag=hotelown] run scoreboard players remove @a[tag=hoteldeluxe] Moneyz 50

execute as @initiator[tag=hotelown] run tell @a[tag=hotel] §aPayed 15 Moneyz for Hotel room

execute as @initiator[tag=hotelown] run tell @a[tag=hotel] §cDon't forget to check out

execute as @initiator[tag=hotelown] run tell @a[tag=hoteldeluxe] §aPayed 50 Moneyz for Hotel deluxe room

execute as @initiator[tag=hotelown] run tell @a[tag=hotel] §cDon't forget to check out