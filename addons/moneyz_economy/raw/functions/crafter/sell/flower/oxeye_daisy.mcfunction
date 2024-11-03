playsound note.bassattack @initiator[hasitem={item=oxeye_daisy,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=oxeye_daisy,quantity=..4}] §cYou can't sell 5 Oxeye Daisies!

playsound random.levelup @initiator[hasitem={item=oxeye_daisy,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=oxeye_daisy,quantity=5..}] §aYou can sell 5 Oxeye Daisies!

scoreboard players add @initiator[hasitem={item=oxeye_daisy,quantity=5..}] Moneyz 15

tell @initiator[hasitem={item=oxeye_daisy,quantity=5..}] §aSold 5 Oxeye Daisies!

clear @initiator[hasitem={item=oxeye_daisy,quantity=5..}] oxeye_daisy 0 5