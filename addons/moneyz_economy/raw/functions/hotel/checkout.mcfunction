playsound note.bassattack @initiator[tag=!hotel,tag=!hoteldeluxe] ~ ~ ~

tell @initiator[tag=!hotel,tag=!hoteldeluxe] §cYou were not Checked in.

playsound note.hat @initiator[tag=hotel] ~ ~ ~ 

tell @initiator[tag=hotel] §aYou are now Checked out.

tag @initiator[tag=hotel] remove hotel

playsound note.hat @initiator[tag=hoteldeluxe] ~ ~ ~ 

tell @initiator[tag=hoteldeluxe] §aYou are now Checked out.

tag @initiator[tag=hoteldeluxe] remove hoteldeluxe