tell @initiator[hasitem={item=warped_fungus_on_a_stick,quantity=..0}] §cYou can't sell a Fungus on a Stick!

tell @initiator[hasitem={item=warped_fungus_on_a_stick,quantity=1..}] §aYou can sell a Fungus on a Stick!

scoreboard players add @initiator[hasitem={item=warped_fungus_on_a_stick,quantity=1..}] Moneyz 40

tell @initiator[hasitem={item=warped_fungus_on_a_stick,quantity=1..}] §aSold a Fungus on a Stick!

clear @initiator[hasitem={item=warped_fungus_on_a_stick,quantity=1..}] warped_fungus_on_a_stick 0 1