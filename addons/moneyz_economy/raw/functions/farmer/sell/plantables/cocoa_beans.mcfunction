playsound note.bassattack @initiator[hasitem={item=cocoa_beans,quantity=..4}] ~ ~ ~

tell @initiator[hasitem={item=cocoa_beans,quantity=..4}] §cYou can't sell 5 Cocoa Beans!

playsound random.levelup @initiator[hasitem={item=cocoa_beans,quantity=5..}] ~ ~ ~

tell @initiator[hasitem={item=cocoa_beans,quantity=5..}] §aYou can sell 5 Cocoa Beans!

scoreboard players add @initiator[hasitem={item=cocoa_beans,quantity=5..}] Moneyz 5

tell @initiator[hasitem={item=cocoa_beans,quantity=5..}] §aSold 5 Cocoa Beans!

clear @initiator[hasitem={item=cocoa_beans,quantity=5..}] cocoa_beans 0 5