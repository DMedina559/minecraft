playsound note.bassattack @initiator[hasitem={item=cookie,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=cookie,quantity=..4}] §cYou can't sell 5 Cookies!

playsound random.levelup @initiator[hasitem={item=cookie,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=cookie,quantity=5..}] §aYou can sell 5 Cookies!

scoreboard players add @initiator[hasitem={item=cookie,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=cookie,quantity=5..}] §aSold 5 Cookies!

clear @initiator[hasitem={item=cookie,quantity=5..}] cookie 0 5