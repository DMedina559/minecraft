playsound note.bassattack @initiator[hasitem={item=candle,quantity=..39}] ~ ~ ~

tell @initiator[hasitem={item=candle,quantity=..39}] §cYou can't sell 40 Candles!

playsound random.levelup @initiator[hasitem={item=candle,quantity=40..}] ~ ~ ~

tell @initiator[hasitem={item=candle,quantity=40..}] §aYou can sell 40 Candles!

scoreboard players add @initiator[hasitem={item=candle,quantity=40..}] Moneyz 40

tell @initiator[hasitem={item=candle,quantity=40..}] §aSold 40 Candles!

clear @initiator[hasitem={item=candle,quantity=40..}] candle  40
