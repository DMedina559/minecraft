execute as @initiator[scores={Moneyz=..999}] run tell @s §cYou can't buy D4001!

execute as @initiator[tag=d4001-resh] run tell @s §cYou already own D4001!

execute as @initiator[scores={Moneyz=1000..},tag=!d4001-resh] run tell @s §aYou can buy D4001!

execute as @initiator[scores={Moneyz=1000..},tag=!d4001-resh] run scoreboard players remove @s Moneyz 1000

execute as @initiator[scores={Moneyz=1000..},tag=!d4001-resh] run tag @s add d4001-resh

execute as @initiator[tag=d4001-resh,tag=!reshresident] run tag @s add reshresident

execute as @initiator[tag=d4001-resh,tag=reshresident] run tell @s §aPurchased D4001!
