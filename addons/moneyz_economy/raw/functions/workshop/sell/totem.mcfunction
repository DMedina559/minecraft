tell @initiator[hasitem={item=totem_of_undying,quantity=..0}] §cYou can't sell a Totem of Undying!

tell @initiator[hasitem={item=totem_of_undying,quantity=1..}] §aYou can sell a Totem of Undying!

scoreboard players add @initiator[hasitem={item=totem_of_undying,quantity=1..}] Moneyz 1500

tell @initiator[hasitem={item=totem_of_undying,quantity=1..}] §aSold a Totem of Undying!

clear @initiator[hasitem={item=totem_of_undying,quantity=1..}] totem_of_undying 0 1