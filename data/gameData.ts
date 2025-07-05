import { Champion, ChampionStaticInfo, Role } from '../types';

type ChampionStaticData = Partial<Champion>;

export const staticChampionInfoList: ChampionStaticInfo[] = [
  { 
    name: "Aatrox", primaryRole: "Top", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Aatrox",
    damageType: "Physical", ccTypes: ["Knockup", "Slow", "Pull"], engagePotential: "Medium", teamArchetypes: ["Dive", "Teamfight", "Juggernaut", "Skirmisher"] 
  },
  { 
    name: "Ahri", primaryRole: "Mid", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Ahri",
    damageType: "Magic", ccTypes: ["Charm", "Slow"], engagePotential: "Medium", teamArchetypes: ["Pick", "Kite", "BurstMage"] 
  },
  { name: "Akali", primaryRole: "Mid", championClass: "Assassin", championSubclass: "Slayer", ddragonKey: "Akali", damageType: "Mixed", ccTypes: ["Stun", "Slow"], engagePotential: "High", teamArchetypes: ["Dive", "Assassin"] },
  { name: "Akshan", primaryRole: "Mid", championClass: "Marksman", championSubclass: "Assassin", ddragonKey: "Akshan", damageType: "Physical", ccTypes: ["Stun", "Slow"], engagePotential: "Medium", teamArchetypes: ["Pick", "Skirmisher"] },
  { 
    name: "Alistar", primaryRole: "Support", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Alistar",
    damageType: "Magic", ccTypes: ["Knockup", "Stun", "Displacement"], engagePotential: "High", teamArchetypes: ["Dive", "Engage", "Peel", "Vanguard"] 
  },
  { name: "Amumu", primaryRole: "Jungle", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Amumu", damageType: "Magic", ccTypes: ["Stun", "Root"], engagePotential: "High", teamArchetypes: ["Dive", "Engage", "Teamfight"] },
  { name: "Anivia", primaryRole: "Mid", championClass: "Mage", championSubclass: "Battle Mage", ddragonKey: "Anivia", damageType: "Magic", ccTypes: ["Stun", "Slow", "Wall"], engagePotential: "Low", teamArchetypes: ["Control", "Siege", "ZoneControl"] },
  { name: "Annie", primaryRole: "Mid", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Annie", damageType: "Magic", ccTypes: ["Stun"], engagePotential: "Medium", teamArchetypes: ["BurstMage", "Teamfight"] },
  { name: "Aphelios", primaryRole: "ADC", championClass: "Marksman", ddragonKey: "Aphelios", damageType: "Physical", ccTypes: ["Root", "Slow"], engagePotential: "Low", teamArchetypes: ["Teamfight", "ScalingCarry"] },
  { 
    name: "Ashe", primaryRole: "ADC", championClass: "Marksman", championSubclass: "Utility", ddragonKey: "Ashe",
    damageType: "Physical", ccTypes: ["Slow", "Stun"], engagePotential: "Medium", teamArchetypes: ["Pick", "Kite", "UtilityCarry"]
  },
  { name: "Aurelion Sol", primaryRole: "Mid", championClass: "Mage", championSubclass: "Battle Mage", ddragonKey: "AurelionSol", damageType: "Magic", ccTypes: ["Stun", "Slow", "Pull"], engagePotential: "Medium", teamArchetypes: ["Scaling", "Teamfight", "ZoneControl"] },
  { name: "Aurora", primaryRole: "Top", championClass: "Fighter", championSubclass: "Skirmisher", ddragonKey: "Aurora", damageType: "Mixed" },
  { name: "Azir", primaryRole: "Mid", championClass: "Mage", championSubclass: "Specialist", ddragonKey: "Azir", damageType: "Magic", ccTypes: ["Knockup", "Slow", "Wall"], engagePotential: "Medium", teamArchetypes: ["Control", "Siege", "Disengage", "Scaling"] },
  { name: "Bard", primaryRole: "Support", championClass: "Controller", championSubclass: "Catcher", ddragonKey: "Bard", damageType: "Magic", ccTypes: ["Stun", "Slow", "Stasis"], engagePotential: "Medium", teamArchetypes: ["Pick", "Roam", "Utility"] },
  { name: "Blitzcrank", primaryRole: "Support", championClass: "Controller", championSubclass: "Catcher", ddragonKey: "Blitzcrank", damageType: "Magic", ccTypes: ["Pull", "Knockup", "Silence"], engagePotential: "High", teamArchetypes: ["Pick", "Engage"] },
  { name: "Brand", primaryRole: "Support", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Brand", damageType: "Magic", ccTypes: ["Stun", "Slow"], engagePotential: "Low", teamArchetypes: ["Poke", "Teamfight", "BurstMage"] },
  { name: "Braum", primaryRole: "Support", championClass: "Tank", championSubclass: "Warden", ddragonKey: "Braum", damageType: "Magic", ccTypes: ["Stun", "Slow", "Knockup"], engagePotential: "Medium", teamArchetypes: ["Peel", "Disengage", "Warden"] },
  { name: "Caitlyn", primaryRole: "ADC", championClass: "Marksman", ddragonKey: "Caitlyn", damageType: "Physical", ccTypes: ["Root", "Slow"], engagePotential: "Low", teamArchetypes: ["Poke", "Siege", "ZoneControl"] },
  { name: "Camille", primaryRole: "Top", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "Camille", damageType: "Physical", ccTypes: ["Stun", "Slow", "Root"], engagePotential: "High", teamArchetypes: ["Dive", "Pick", "SplitPush"] },
  { name: "Cassiopeia", primaryRole: "Mid", championClass: "Mage", championSubclass: "Battle Mage", ddragonKey: "Cassiopeia", damageType: "Magic", ccTypes: ["Stun", "Slow", "Grounding"], engagePotential: "Low", teamArchetypes: ["Control", "DPS", "Kite"] },
  { name: "Cho'Gath", primaryRole: "Top", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Chogath", damageType: "Mixed", ccTypes: ["Knockup", "Silence", "Slow"], engagePotential: "Medium", teamArchetypes: ["Tank", "Control", "Scaling"] },
  { name: "Corki", primaryRole: "Mid", championClass: "Marksman", championSubclass: "Specialist", ddragonKey: "Corki", damageType: "Mixed", ccTypes: ["Slow", "Displacement"], engagePotential: "Low", teamArchetypes: ["Poke", "Siege"] },
  { name: "Darius", primaryRole: "Top", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Darius", damageType: "Physical", ccTypes: ["Pull", "Slow"], engagePotential: "Low", teamArchetypes: ["Juggernaut", "Teamfight"] },
  { name: "Diana", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "Diana", damageType: "Magic", ccTypes: ["Pull", "Slow", "Knockup"], engagePotential: "High", teamArchetypes: ["Dive", "Assassin", "Teamfight"] },
  { name: "Dr. Mundo", primaryRole: "Top", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "DrMundo", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "Low", teamArchetypes: ["Juggernaut", "Tank", "SplitPush"] },
  { name: "Draven", primaryRole: "ADC", championClass: "Marksman", ddragonKey: "Draven", damageType: "Physical", ccTypes: ["Slow", "Displacement"], engagePotential: "Low", teamArchetypes: ["Snowball", "Aggression"] },
  { name: "Ekko", primaryRole: "Jungle", championClass: "Assassin", championSubclass: "Slayer", ddragonKey: "Ekko", damageType: "Magic", ccTypes: ["Stun", "Slow"], engagePotential: "Medium", teamArchetypes: ["Dive", "Assassin", "Skirmisher"] },
  { name: "Elise", primaryRole: "Jungle", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Elise", damageType: "Magic", ccTypes: ["Stun"], engagePotential: "High", teamArchetypes: ["Pick", "Dive", "EarlyGame"] },
  { name: "Evelynn", primaryRole: "Jungle", championClass: "Assassin", championSubclass: "Slayer", ddragonKey: "Evelynn", damageType: "Magic", ccTypes: ["Charm", "Slow"], engagePotential: "High", teamArchetypes: ["Assassin", "Pick"] },
  { name: "Ezreal", primaryRole: "ADC", championClass: "Marksman", ddragonKey: "Ezreal", damageType: "Mixed", ccTypes: ["Slow"], engagePotential: "Low", teamArchetypes: ["Poke", "Kite", "MidGameSpike"] },
  { name: "Fiddlesticks", primaryRole: "Jungle", championClass: "Mage", championSubclass: "Specialist", ddragonKey: "Fiddlesticks", damageType: "Magic", ccTypes: ["Fear", "Silence", "Slow"], engagePotential: "High", teamArchetypes: ["Teamfight", "Ambush", "Control"] },
  { name: "Fiora", primaryRole: "Top", championClass: "Fighter", championSubclass: "Skirmisher", ddragonKey: "Fiora", damageType: "Physical", ccTypes: ["Slow", "Stun"], engagePotential: "Medium", teamArchetypes: ["SplitPush", "Duelist", "Skirmisher"] },
  { name: "Fizz", primaryRole: "Mid", championClass: "Assassin", championSubclass: "Slayer", ddragonKey: "Fizz", damageType: "Magic", ccTypes: ["Knockup", "Slow"], engagePotential: "High", teamArchetypes: ["Assassin", "Dive"] },
  { name: "Galio", primaryRole: "Mid", championClass: "Tank", championSubclass: "Warden", ddragonKey: "Galio", damageType: "Magic", ccTypes: ["Taunt", "Knockup", "Slow"], engagePotential: "High", teamArchetypes: ["Teamfight", "Engage", "AntiMagic"] },
  { name: "Gangplank", primaryRole: "Top", championClass: "Fighter", championSubclass: "Specialist", ddragonKey: "Gangplank", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "Low", teamArchetypes: ["Scaling", "ZoneControl", "SplitPush"] },
  { name: "Garen", primaryRole: "Top", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Garen", damageType: "Physical", ccTypes: ["Silence"], engagePotential: "Low", teamArchetypes: ["Juggernaut", "Teamfight"] },
  { name: "Gnar", primaryRole: "Top", championClass: "Fighter", championSubclass: "Specialist", ddragonKey: "Gnar", damageType: "Physical", ccTypes: ["Slow", "Stun", "Knockup"], engagePotential: "Medium", teamArchetypes: ["Teamfight", "Kite", "SplitPush"] },
  { name: "Gragas", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Vanguard", ddragonKey: "Gragas", damageType: "Magic", ccTypes: ["Slow", "Stun", "Displacement"], engagePotential: "High", teamArchetypes: ["Engage", "Pick", "Disengage"] },
  { name: "Graves", primaryRole: "Jungle", championClass: "Marksman", championSubclass: "Specialist", ddragonKey: "Graves", damageType: "Physical", ccTypes: ["Slow", "Blind"], engagePotential: "Medium", teamArchetypes: ["Skirmisher", "Burst"] },
  { name: "Gwen", primaryRole: "Top", championClass: "Fighter", championSubclass: "Skirmisher", ddragonKey: "Gwen", damageType: "Magic", ccTypes: ["Slow"], engagePotential: "Medium", teamArchetypes: ["Skirmisher", "AntiTank", "SplitPush"] },
  { name: "Hecarim", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "Hecarim", damageType: "Physical", ccTypes: ["Fear", "Knockback"], engagePotential: "High", teamArchetypes: ["Dive", "Engage"] },
  { name: "Heimerdinger", primaryRole: "Top", championClass: "Mage", championSubclass: "Specialist", ddragonKey: "Heimerdinger", damageType: "Magic", ccTypes: ["Stun", "Slow"], engagePotential: "Low", teamArchetypes: ["Siege", "ZoneControl", "Poke"] },
  { name: "Illaoi", primaryRole: "Top", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Illaoi", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "Low", teamArchetypes: ["ZoneControl", "Juggernaut", "SplitPush"] },
  { name: "Irelia", primaryRole: "Mid", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "Irelia", damageType: "Physical", ccTypes: ["Stun", "Slow"], engagePotential: "High", teamArchetypes: ["Dive", "Skirmisher", "Snowball"] },
  { name: "Ivern", primaryRole: "Jungle", championClass: "Controller", championSubclass: "Catcher", ddragonKey: "Ivern", damageType: "Magic", ccTypes: ["Root", "Knockup", "Slow"], engagePotential: "Medium", teamArchetypes: ["Utility", "Peel", "SupportiveJungle"] },
  { name: "Janna", primaryRole: "Support", championClass: "Controller", championSubclass: "Enchanter", ddragonKey: "Janna", damageType: "Magic", ccTypes: ["Knockup", "Slow", "Displacement"], engagePotential: "Low", teamArchetypes: ["Peel", "Disengage", "Enchanter"] },
  { name: "Jarvan IV", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "JarvanIV", damageType: "Physical", ccTypes: ["Knockup", "Slow", "Terrain"], engagePotential: "High", teamArchetypes: ["Engage", "Dive", "Pick"] },
  { name: "Jax", primaryRole: "Top", championClass: "Fighter", championSubclass: "Skirmisher", ddragonKey: "Jax", damageType: "Mixed", ccTypes: ["Stun"], engagePotential: "Medium", teamArchetypes: ["SplitPush", "Skirmisher", "Scaling"] },
  { name: "Jayce", primaryRole: "Top", championClass: "Fighter", championSubclass: "Artillery", ddragonKey: "Jayce", damageType: "Physical", ccTypes: ["Slow", "Knockback"], engagePotential: "Low", teamArchetypes: ["Poke", "Siege", "SplitPush"] },
  { name: "Jhin", primaryRole: "ADC", championClass: "Marksman", championSubclass: "Catcher", ddragonKey: "Jhin", damageType: "Physical", ccTypes: ["Root", "Slow"], engagePotential: "Low", teamArchetypes: ["Pick", "UtilityCarry", "Burst"] },
  { name: "Jinx", primaryRole: "ADC", championClass: "Marksman", ddragonKey: "Jinx", damageType: "Physical", ccTypes: ["Root", "Slow"], engagePotential: "Low", teamArchetypes: ["ScalingCarry", "Teamfight", "ResetMechanic"] },
  { name: "Kai'Sa", primaryRole: "ADC", championClass: "Marksman", championSubclass: "Diver", ddragonKey: "Kaisa", damageType: "Mixed", ccTypes: ["Slow"], engagePotential: "Medium", teamArchetypes: ["Dive", "Burst", "ScalingCarry"] },
  { name: "Kalista", primaryRole: "ADC", championClass: "Marksman", ddragonKey: "Kalista", damageType: "Physical", ccTypes: ["Slow", "Knockup"], engagePotential: "Medium", teamArchetypes: ["Kite", "ObjectiveControl"] },
  { name: "Karma", primaryRole: "Support", championClass: "Controller", championSubclass: "Enchanter", ddragonKey: "Karma", damageType: "Magic", ccTypes: ["Root", "Slow"], engagePotential: "Low", teamArchetypes: ["Poke", "Peel", "Utility"] },
  { name: "Karthus", primaryRole: "Jungle", championClass: "Mage", championSubclass: "Battle Mage", ddragonKey: "Karthus", damageType: "Magic", ccTypes: ["Slow"], engagePotential: "Low", teamArchetypes: ["Scaling", "Teamfight", "GlobalPressure"] },
  { name: "Kassadin", primaryRole: "Mid", championClass: "Assassin", championSubclass: "Slayer", ddragonKey: "Kassadin", damageType: "Magic", ccTypes: ["Slow", "Silence"], engagePotential: "High", teamArchetypes: ["Scaling", "AntiMage", "Assassin"] },
  { name: "Katarina", primaryRole: "Mid", championClass: "Assassin", championSubclass: "Slayer", ddragonKey: "Katarina", damageType: "Magic", ccTypes: [], engagePotential: "High", teamArchetypes: ["Assassin", "Teamfight", "ResetMechanic"] },
  { name: "Kayle", primaryRole: "Top", championClass: "Fighter", championSubclass: "Specialist", ddragonKey: "Kayle", damageType: "Mixed", ccTypes: ["Slow"], engagePotential: "Low", teamArchetypes: ["ScalingCarry", "Teamfight", "Protective"] },
  { name: "Kayn", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Skirmisher", ddragonKey: "Kayn", damageType: "Physical", ccTypes: ["Knockup", "Slow"], engagePotential: "Medium", teamArchetypes: ["Skirmisher", "DiveOrAssassin"] }, // Depends on form
  { name: "Kennen", primaryRole: "Top", championClass: "Mage", championSubclass: "Battle Mage", ddragonKey: "Kennen", damageType: "Magic", ccTypes: ["Stun"], engagePotential: "High", teamArchetypes: ["Teamfight", "Engage", "Poke"] },
  { name: "Kha'Zix", primaryRole: "Jungle", championClass: "Assassin", championSubclass: "Slayer", ddragonKey: "Khazix", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "Medium", teamArchetypes: ["Assassin", "Pick", "Isolation"] },
  { name: "Kindred", primaryRole: "Jungle", championClass: "Marksman", ddragonKey: "Kindred", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "Low", teamArchetypes: ["ScalingCarry", "ObjectiveControl", "ProtectiveTeamfight"] },
  { name: "Kled", primaryRole: "Top", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "Kled", damageType: "Physical", ccTypes: ["Pull", "Slow"], engagePotential: "High", teamArchetypes: ["Dive", "Engage", "Skirmisher"] },
  { name: "Kog'Maw", primaryRole: "ADC", championClass: "Marksman", championSubclass: "Artillery", ddragonKey: "KogMaw", damageType: "Mixed", ccTypes: ["Slow"], engagePotential: "Low", teamArchetypes: ["ScalingCarry", "Poke", "AntiTank"] },
  { name: "LeBlanc", primaryRole: "Mid", championClass: "Assassin", championSubclass: "Burst Mage", ddragonKey: "Leblanc", damageType: "Magic", ccTypes: ["Root", "Slow"], engagePotential: "High", teamArchetypes: ["Assassin", "Pick", "BurstMage"] },
  { name: "Lee Sin", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "LeeSin", damageType: "Physical", ccTypes: ["Slow", "Knockback"], engagePotential: "High", teamArchetypes: ["EarlyGame", "Pick", "Dive", "Skirmisher"] },
  { 
    name: "Leona", primaryRole: "Support", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Leona",
    damageType: "Magic", ccTypes: ["Stun", "Root"], engagePotential: "High", teamArchetypes: ["Engage", "Dive", "Vanguard", "Pick"]
  },
  { name: "Lillia", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Skirmisher", ddragonKey: "Lillia", damageType: "Magic", ccTypes: ["Slow", "Sleep"], engagePotential: "Medium", teamArchetypes: ["Teamfight", "Skirmisher", "Kite"] },
  { name: "Lissandra", primaryRole: "Mid", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Lissandra", damageType: "Magic", ccTypes: ["Root", "Slow", "Stun"], engagePotential: "High", teamArchetypes: ["Engage", "Control", "BurstMage", "Pick"] },
  { name: "Lucian", primaryRole: "ADC", championClass: "Marksman", ddragonKey: "Lucian", damageType: "Physical", ccTypes: [], engagePotential: "Medium", teamArchetypes: ["MidGameSpike", "Burst", "Skirmisher"] },
  { 
    name: "Lulu", primaryRole: "Support", championClass: "Controller", championSubclass: "Enchanter", ddragonKey: "Lulu",
    damageType: "Magic", ccTypes: ["Polymorph", "Slow", "Knockup"], engagePotential: "Low", teamArchetypes: ["Peel", "Enchanter", "ProtectCarry"]
  },
  { 
    name: "Lux", primaryRole: "Support", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Lux",
    damageType: "Magic", ccTypes: ["Root", "Slow"], engagePotential: "Low", teamArchetypes: ["Poke", "BurstMage", "Pick", "Siege"]
  },
  { 
    name: "Malphite", primaryRole: "Top", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Malphite",
    damageType: "Magic", ccTypes: ["Knockup", "Slow"], engagePotential: "High", teamArchetypes: ["Engage", "Teamfight", "Vanguard", "AntiAD"]
  },
  { name: "Malzahar", primaryRole: "Mid", championClass: "Mage", championSubclass: "Battle Mage", ddragonKey: "Malzahar", damageType: "Magic", ccTypes: ["Suppression", "Silence", "Slow"], engagePotential: "Medium", teamArchetypes: ["Control", "Pick", "AntiCarry"] },
  { name: "Maokai", primaryRole: "Support", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Maokai", damageType: "Magic", ccTypes: ["Root", "Knockback", "Slow"], engagePotential: "High", teamArchetypes: ["Engage", "Peel", "ZoneControl"] },
  { name: "Master Yi", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Skirmisher", ddragonKey: "MasterYi", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "High", teamArchetypes: ["ScalingCarry", "Skirmisher", "Cleanup"] }, // Engage potential is conditional
  { name: "Miss Fortune", primaryRole: "ADC", championClass: "Marksman", ddragonKey: "MissFortune", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "Low", teamArchetypes: ["Teamfight", "EarlyPressure", "Burst"] },
  { name: "Wukong", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "MonkeyKing", damageType: "Physical", ccTypes: ["Knockup"], engagePotential: "High", teamArchetypes: ["Dive", "Teamfight", "Engage"] },
  { name: "Mordekaiser", primaryRole: "Top", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Mordekaiser", damageType: "Magic", ccTypes: ["Pull", "Isolation"], engagePotential: "Medium", teamArchetypes: ["Juggernaut", "Duelist", "Pick", "AntiCarry"] },
  { name: "Morgana", primaryRole: "Support", championClass: "Controller", championSubclass: "Catcher", ddragonKey: "Morgana", damageType: "Magic", ccTypes: ["Root", "Stun"], engagePotential: "Low", teamArchetypes: ["Pick", "Peel", "AntiCC"] },
  { name: "Nami", primaryRole: "Support", championClass: "Controller", championSubclass: "Enchanter", ddragonKey: "Nami", damageType: "Magic", ccTypes: ["Knockup", "Stun", "Slow"], engagePotential: "Medium", teamArchetypes: ["Engage", "Disengage", "Peel", "Enchanter"] },
  { name: "Nasus", primaryRole: "Top", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Nasus", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "Low", teamArchetypes: ["Scaling", "SplitPush", "Juggernaut"] },
  { name: "Nautilus", primaryRole: "Support", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Nautilus", damageType: "Magic", ccTypes: ["Pull", "Root", "Knockup", "Slow"], engagePotential: "High", teamArchetypes: ["Engage", "Pick", "Vanguard"] },
  { name: "Neeko", primaryRole: "Mid", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Neeko", damageType: "Magic", ccTypes: ["Root", "Stun"], engagePotential: "Medium", teamArchetypes: ["Engage", "Pick", "BurstMage"] },
  { name: "Nidalee", primaryRole: "Jungle", championClass: "Assassin", championSubclass: "Artillery", ddragonKey: "Nidalee", damageType: "Magic", ccTypes: ["Root"], engagePotential: "Medium", teamArchetypes: ["Poke", "Pick", "EarlyGame"] }, // Root is on trap
  { name: "Nilah", primaryRole: "ADC", championClass: "Fighter", championSubclass:"Skirmisher", ddragonKey: "Nilah", damageType: "Physical", ccTypes: ["Pull", "Slow"], engagePotential: "High", teamArchetypes: ["Dive", "Teamfight", "Skirmisher"] },
  { name: "Nocturne", primaryRole: "Jungle", championClass: "Assassin", championSubclass: "Diver", ddragonKey: "Nocturne", damageType: "Physical", ccTypes: ["Fear", "Slow"], engagePotential: "High", teamArchetypes: ["Dive", "Pick", "Assassin"] },
  { name: "Nunu & Willump", primaryRole: "Jungle", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Nunu", damageType: "Magic", ccTypes: ["Knockup", "Root", "Slow"], engagePotential: "High", teamArchetypes: ["Engage", "ObjectiveControl", "Tank"] },
  { name: "Olaf", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Olaf", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "High", teamArchetypes: ["Dive", "Juggernaut", "AntiCC"] }, // Engage is high due to ult
  { name: "Orianna", primaryRole: "Mid", championClass: "Mage", championSubclass: "Battle Mage", ddragonKey: "Orianna", damageType: "Magic", ccTypes: ["Knockup", "Slow"], engagePotential: "Medium", teamArchetypes: ["Teamfight", "Control", "Utility"] },
  { name: "Ornn", primaryRole: "Top", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Ornn", damageType: "Magic", ccTypes: ["Knockup", "Slow", "Brittle"], engagePotential: "High", teamArchetypes: ["Engage", "Teamfight", "Tank", "Utility"] },
  { name: "Pantheon", primaryRole: "Support", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "Pantheon", damageType: "Physical", ccTypes: ["Stun", "Slow"], engagePotential: "High", teamArchetypes: ["Engage", "Pick", "Dive"] },
  { name: "Poppy", primaryRole: "Jungle", championClass: "Tank", championSubclass: "Warden", ddragonKey: "Poppy", damageType: "Physical", ccTypes: ["Stun", "Knockback", "Slow"], engagePotential: "Medium", teamArchetypes: ["AntiDive", "Peel", "Pick"] },
  { name: "Pyke", primaryRole: "Support", championClass: "Assassin", championSubclass: "Slayer", ddragonKey: "Pyke", damageType: "Physical", ccTypes: ["Pull", "Stun", "Slow"], engagePotential: "High", teamArchetypes: ["Pick", "Roam", "Assassin", "Cleanup"] },
  { name: "Qiyana", primaryRole: "Mid", championClass: "Assassin", championSubclass: "Slayer", ddragonKey: "Qiyana", damageType: "Physical", ccTypes: ["Stun", "Root", "Knockback", "Slow"], engagePotential: "High", teamArchetypes: ["Assassin", "Teamfight", "Pick"] },
  { name: "Quinn", primaryRole: "Top", championClass: "Marksman", championSubclass: "Specialist", ddragonKey: "Quinn", damageType: "Physical", ccTypes: ["Blind", "Slow", "Knockback"], engagePotential: "Medium", teamArchetypes: ["SplitPush", "Pick", "Roam"] },
  { name: "Rakan", primaryRole: "Support", championClass: "Controller", championSubclass: "Catcher", ddragonKey: "Rakan", damageType: "Magic", ccTypes: ["Knockup", "Charm"], engagePotential: "High", teamArchetypes: ["Engage", "Dive", "Peel"] },
  { name: "Rammus", primaryRole: "Jungle", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Rammus", damageType: "Magic", ccTypes: ["Taunt", "Knockup", "Slow"], engagePotential: "High", teamArchetypes: ["Engage", "Dive", "AntiAD", "Tank"] },
  { name: "Rek'Sai", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "RekSai", damageType: "Physical", ccTypes: ["Knockup"], engagePotential: "High", teamArchetypes: ["Dive", "Pick", "EarlyGame"] },
  { name: "Rell", primaryRole: "Support", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Rell", damageType: "Magic", ccTypes: ["Stun", "Knockup", "Pull", "Slow"], engagePotential: "High", teamArchetypes: ["Engage", "Dive", "Teamfight"] },
  { name: "Renata Glasc", primaryRole: "Support", championClass: "Controller", championSubclass: "Enchanter", ddragonKey: "Renata", damageType: "Magic", ccTypes: ["Berserk", "Root", "Slow", "Knockback"], engagePotential: "Medium", teamArchetypes: ["Disengage", "Control", "Enchanter", "Teamfight"] },
  { name: "Renekton", primaryRole: "Top", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "Renekton", damageType: "Physical", ccTypes: ["Stun"], engagePotential: "High", teamArchetypes: ["Dive", "EarlyGame", "Skirmisher"] },
  { name: "Rengar", primaryRole: "Jungle", championClass: "Assassin", championSubclass: "Diver", ddragonKey: "Rengar", damageType: "Physical", ccTypes: ["Root", "Slow"], engagePotential: "High", teamArchetypes: ["Assassin", "Pick", "Snowball"] },
  { name: "Riven", primaryRole: "Top", championClass: "Fighter", championSubclass: "Skirmisher", ddragonKey: "Riven", damageType: "Physical", ccTypes: ["Stun", "Knockup", "Slow"], engagePotential: "High", teamArchetypes: ["Skirmisher", "Snowball", "Dive"] },
  { name: "Rumble", primaryRole: "Mid", championClass: "Fighter", championSubclass: "Battle Mage", ddragonKey: "Rumble", damageType: "Magic", ccTypes: ["Slow"], engagePotential: "Medium", teamArchetypes: ["Teamfight", "ZoneControl", "Poke"] },
  { name: "Ryze", primaryRole: "Mid", championClass: "Mage", championSubclass: "Battle Mage", ddragonKey: "Ryze", damageType: "Magic", ccTypes: ["Root", "Slow"], engagePotential: "Low", teamArchetypes: ["Scaling", "SplitPush", "DPS"] },
  { name: "Samira", primaryRole: "ADC", championClass: "Marksman", championSubclass: "Skirmisher", ddragonKey: "Samira", damageType: "Physical", ccTypes: ["Knockup", "Slow"], engagePotential: "High", teamArchetypes: ["Teamfight", "Dive", "Cleanup", "Snowball"] },
  { name: "Sejuani", primaryRole: "Jungle", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Sejuani", damageType: "Magic", ccTypes: ["Stun", "Knockup", "Slow"], engagePotential: "High", teamArchetypes: ["Engage", "Teamfight", "Tank"] },
  { name: "Senna", primaryRole: "Support", championClass: "Marksman", championSubclass: "Specialist", ddragonKey: "Senna", damageType: "Physical", ccTypes: ["Root", "Slow"], engagePotential: "Low", teamArchetypes: ["ScalingCarry", "Utility", "Poke"] },
  { name: "Seraphine", primaryRole: "Support", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Seraphine", damageType: "Magic", ccTypes: ["Charm", "Root", "Slow"], engagePotential: "Medium", teamArchetypes: ["Teamfight", "Poke", "Utility", "Enchanter"] },
  { name: "Sett", primaryRole: "Top", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Sett", damageType: "Physical", ccTypes: ["Stun", "Slow", "Pull", "Suppression"], engagePotential: "Medium", teamArchetypes: ["Juggernaut", "Teamfight", "Engage"] },
  { name: "Shaco", primaryRole: "Jungle", championClass: "Assassin", championSubclass: "Slayer", ddragonKey: "Shaco", damageType: "Mixed", ccTypes: ["Fear", "Slow"], engagePotential: "Medium", teamArchetypes: ["Assassin", "Pick", "SplitPush", "ZoneControl"] },
  { name: "Shen", primaryRole: "Top", championClass: "Tank", championSubclass: "Warden", ddragonKey: "Shen", damageType: "Magic", ccTypes: ["Taunt", "Slow"], engagePotential: "Medium", teamArchetypes: ["SplitPush", "Peel", "GlobalPressure", "Warden"] },
  { name: "Shyvana", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Shyvana", damageType: "Mixed", ccTypes: ["Knockback"], engagePotential: "High", teamArchetypes: ["Dive", "Teamfight", "Juggernaut", "ObjectiveControl"] }, // Engage is high in dragon form
  { name: "Singed", primaryRole: "Top", championClass: "Tank", championSubclass: "Specialist", ddragonKey: "Singed", damageType: "Magic", ccTypes: ["Slow", "Root", "Displacement"], engagePotential: "Medium", teamArchetypes: ["Disruptor", "SplitPush", "ZoneControl"] },
  { name: "Sion", primaryRole: "Top", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Sion", damageType: "Physical", ccTypes: ["Knockup", "Slow"], engagePotential: "High", teamArchetypes: ["Engage", "SplitPush", "Tank", "Teamfight"] },
  { name: "Sivir", primaryRole: "ADC", championClass: "Marksman", ddragonKey: "Sivir", damageType: "Physical", ccTypes: [], engagePotential: "Low", teamArchetypes: ["Teamfight", "Utility", "WaveClear", "Poke"] }, // Engage via ult speed up
  { name: "Skarner", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "Skarner", damageType: "Physical", ccTypes: ["Suppression", "Stun", "Slow"], engagePotential: "High", teamArchetypes: ["Pick", "Dive", "Tank"] },
  { name: "Sona", primaryRole: "Support", championClass: "Controller", championSubclass: "Enchanter", ddragonKey: "Sona", damageType: "Magic", ccTypes: ["Stun", "Slow"], engagePotential: "Medium", teamArchetypes: ["Enchanter", "Teamfight", "Scaling", "Poke"] }, // Engage via ult
  { name: "Soraka", primaryRole: "Support", championClass: "Controller", championSubclass: "Enchanter", ddragonKey: "Soraka", damageType: "Magic", ccTypes: ["Silence", "Root", "Slow"], engagePotential: "Low", teamArchetypes: ["Enchanter", "Sustain", "Peel"] },
  { name: "Swain", primaryRole: "Support", championClass: "Mage", championSubclass: "Battle Mage", ddragonKey: "Swain", damageType: "Magic", ccTypes: ["Root", "Slow", "Pull"], engagePotential: "Medium", teamArchetypes: ["Teamfight", "Control", "DrainTank"] },
  { name: "Sylas", primaryRole: "Mid", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Sylas", damageType: "Magic", ccTypes: ["Knockup", "Slow", "Pull"], engagePotential: "High", teamArchetypes: ["Dive", "Skirmisher", "Versatile"] }, // CC depends on stolen ult
  { name: "Syndra", primaryRole: "Mid", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Syndra", damageType: "Magic", ccTypes: ["Stun", "Slow"], engagePotential: "Low", teamArchetypes: ["BurstMage", "Pick", "Control"] },
  { name: "Tahm Kench", primaryRole: "Support", championClass: "Tank", championSubclass: "Warden", ddragonKey: "TahmKench", damageType: "Magic", ccTypes: ["Stun", "Slow", "Knockup", "Suppression"], engagePotential: "Medium", teamArchetypes: ["Peel", "Warden", "Pick", "Protective"] },
  { name: "Taliyah", primaryRole: "Jungle", championClass: "Mage", championSubclass: "Battle Mage", ddragonKey: "Taliyah", damageType: "Magic", ccTypes: ["Knockup", "Slow", "Wall"], engagePotential: "Medium", teamArchetypes: ["Roam", "Control", "Pick", "Burst"] },
  { name: "Talon", primaryRole: "Mid", championClass: "Assassin", championSubclass: "Slayer", ddragonKey: "Talon", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "High", teamArchetypes: ["Assassin", "Roam", "Pick", "Snowball"] },
  { name: "Taric", primaryRole: "Support", championClass: "Tank", championSubclass: "Warden", ddragonKey: "Taric", damageType: "Magic", ccTypes: ["Stun"], engagePotential: "Medium", teamArchetypes: ["Peel", "Teamfight", "Protective", "Warden"] },
  { name: "Teemo", primaryRole: "Top", championClass: "Marksman", championSubclass: "Specialist", ddragonKey: "Teemo", damageType: "Magic", ccTypes: ["Blind", "Slow"], engagePotential: "Low", teamArchetypes: ["ZoneControl", "Poke", "SplitPush", "Annoyance"] },
  { name: "Thresh", primaryRole: "Support", championClass: "Controller", championSubclass: "Catcher", ddragonKey: "Thresh", damageType: "Magic", ccTypes: ["Pull", "Knockback", "Slow"], engagePotential: "High", teamArchetypes: ["Pick", "Peel", "Utility", "Engage"] },
  { name: "Tristana", primaryRole: "ADC", championClass: "Marksman", ddragonKey: "Tristana", damageType: "Physical", ccTypes: ["Slow", "Knockback"], engagePotential: "Medium", teamArchetypes: ["ScalingCarry", "Siege", "ResetMechanic", "SelfPeel"] },
  { name: "Trundle", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Trundle", damageType: "Physical", ccTypes: ["Slow", "Pillar"], engagePotential: "Medium", teamArchetypes: ["AntiTank", "SplitPush", "Skirmisher", "ObjectiveControl"] },
  { name: "Tryndamere", primaryRole: "Top", championClass: "Fighter", championSubclass: "Skirmisher", ddragonKey: "Tryndamere", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "High", teamArchetypes: ["SplitPush", "Skirmisher", "ScalingCarry", "Dive"] }, // Engage is conditional
  { name: "Twisted Fate", primaryRole: "Mid", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "TwistedFate", damageType: "Magic", ccTypes: ["Stun", "Slow"], engagePotential: "Medium", teamArchetypes: ["Pick", "GlobalPressure", "SplitPush", "Utility"] },
  { name: "Twitch", primaryRole: "ADC", championClass: "Marksman", championSubclass: "Assassin", ddragonKey: "Twitch", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "Medium", teamArchetypes: ["ScalingCarry", "Teamfight", "Ambush", "Assassin"] },
  { name: "Udyr", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Udyr", damageType: "Mixed", ccTypes: ["Stun", "Slow"], engagePotential: "Medium", teamArchetypes: ["Skirmisher", "Tank", "Juggernaut"] },
  { name: "Urgot", primaryRole: "Top", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Urgot", damageType: "Physical", ccTypes: ["Slow", "Stun", "Suppression", "Displacement"], engagePotential: "Medium", teamArchetypes: ["AntiCarry", "Juggernaut", "Pick", "Teamfight"] },
  { name: "Varus", primaryRole: "ADC", championClass: "Marksman", championSubclass: "Artillery", ddragonKey: "Varus", damageType: "Physical", ccTypes: ["Root", "Slow"], engagePotential: "Medium", teamArchetypes: ["Poke", "Engage", "Teamfight", "UtilityCarry"] }, // Engage via ult
  { name: "Vayne", primaryRole: "ADC", championClass: "Marksman", championSubclass: "Skirmisher", ddragonKey: "Vayne", damageType: "Physical", ccTypes: ["Stun", "Knockback"], engagePotential: "Low", teamArchetypes: ["ScalingCarry", "AntiTank", "Skirmisher", "SelfPeel"] },
  { name: "Veigar", primaryRole: "Mid", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Veigar", damageType: "Magic", ccTypes: ["Stun", "Slow"], engagePotential: "Low", teamArchetypes: ["Scaling", "BurstMage", "AntiCarry", "ZoneControl"] }, // Stun is AoE cage
  { name: "Vel'Koz", primaryRole: "Support", championClass: "Mage", championSubclass: "Artillery", ddragonKey: "Velkoz", damageType: "Magic", ccTypes: ["Knockup", "Slow"], engagePotential: "Low", teamArchetypes: ["Poke", "Siege", "TrueDamage"] },
  { name: "Vex", primaryRole: "Mid", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Vex", damageType: "Magic", ccTypes: ["Fear", "Slow", "Knockup"], engagePotential: "Medium", teamArchetypes: ["AntiMobility", "BurstMage", "Teamfight"] },
  { name: "Vi", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "Vi", damageType: "Physical", ccTypes: ["Knockup", "Knockback", "Slow"], engagePotential: "High", teamArchetypes: ["Dive", "Pick", "Engage"] },
  { name: "Viego", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Skirmisher", ddragonKey: "Viego", damageType: "Physical", ccTypes: ["Stun", "Slow"], engagePotential: "Medium", teamArchetypes: ["Skirmisher", "ResetMechanic", "Teamfight"] },
  { name: "Viktor", primaryRole: "Mid", championClass: "Mage", championSubclass: "Battle Mage", ddragonKey: "Viktor", damageType: "Magic", ccTypes: ["Slow", "Pull", "Silence"], engagePotential: "Low", teamArchetypes: ["Scaling", "Control", "Teamfight", "ZoneControl"] },
  { name: "Vladimir", primaryRole: "Mid", championClass: "Mage", championSubclass: "Battle Mage", ddragonKey: "Vladimir", damageType: "Magic", ccTypes: ["Slow"], engagePotential: "Medium", teamArchetypes: ["Scaling", "Teamfight", "DrainTank", "Dive"] }, // Engage is more about diving post-items
  { name: "Volibear", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Volibear", damageType: "Mixed", ccTypes: ["Stun", "Slow", "Knockback"], engagePotential: "High", teamArchetypes: ["Dive", "Engage", "Juggernaut", "TowerDisable"] },
  { name: "Warwick", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "Warwick", damageType: "Mixed", ccTypes: ["Fear", "Suppression", "Slow"], engagePotential: "High", teamArchetypes: ["Dive", "Pick", "Skirmisher"] },
  { name: "Xayah", primaryRole: "ADC", championClass: "Marksman", ddragonKey: "Xayah", damageType: "Physical", ccTypes: ["Root"], engagePotential: "Low", teamArchetypes: ["Teamfight", "SelfPeel", "AOEDamage"] },
  { name: "Xerath", primaryRole: "Support", championClass: "Mage", championSubclass: "Artillery", ddragonKey: "Xerath", damageType: "Magic", ccTypes: ["Stun", "Slow"], engagePotential: "Low", teamArchetypes: ["Poke", "Siege", "Artillery"] },
  { name: "Xin Zhao", primaryRole: "Jungle", championClass: "Fighter", championSubclass: "Diver", ddragonKey: "XinZhao", damageType: "Physical", ccTypes: ["Knockup", "Slow"], engagePotential: "High", teamArchetypes: ["Dive", "Engage", "EarlyGame"] },
  { name: "Yasuo", primaryRole: "Mid", championClass: "Fighter", championSubclass: "Skirmisher", ddragonKey: "Yasuo", damageType: "Physical", ccTypes: ["Knockup"], engagePotential: "High", teamArchetypes: ["Skirmisher", "Teamfight", "ScalingCarry", "WindwallUtility"] }, // Engage often relies on team
  { name: "Yone", primaryRole: "Mid", championClass: "Fighter", championSubclass: "Skirmisher", ddragonKey: "Yone", damageType: "Mixed", ccTypes: ["Knockup", "Pull"], engagePotential: "High", teamArchetypes: ["Skirmisher", "Dive", "Teamfight"] },
  { name: "Yorick", primaryRole: "Top", championClass: "Fighter", championSubclass: "Juggernaut", ddragonKey: "Yorick", damageType: "Physical", ccTypes: ["Slow", "Wall"], engagePotential: "Low", teamArchetypes: ["SplitPush", "Juggernaut", "ZoneControl"] },
  { name: "Yuumi", primaryRole: "Support", championClass: "Controller", championSubclass: "Enchanter", ddragonKey: "Yuumi", damageType: "Magic", ccTypes: ["Root", "Slow"], engagePotential: "Low", teamArchetypes: ["Enchanter", "Scaling", "Poke"] },
  { name: "Zac", primaryRole: "Jungle", championClass: "Tank", championSubclass: "Vanguard", ddragonKey: "Zac", damageType: "Magic", ccTypes: ["Knockup", "Slow", "Pull"], engagePotential: "High", teamArchetypes: ["Engage", "Dive", "Teamfight", "Tank"] },
  { name: "Zed", primaryRole: "Mid", championClass: "Assassin", championSubclass: "Slayer", ddragonKey: "Zed", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "High", teamArchetypes: ["Assassin", "Pick", "SplitPush", "Snowball"] },
  { name: "Zeri", primaryRole: "ADC", championClass: "Marksman", ddragonKey: "Zeri", damageType: "Physical", ccTypes: ["Slow"], engagePotential: "Low", teamArchetypes: ["Skirmisher", "Kite", "ScalingCarry"] },
  { name: "Ziggs", primaryRole: "Mid", championClass: "Mage", championSubclass: "Artillery", ddragonKey: "Ziggs", damageType: "Magic", ccTypes: ["Knockback", "Slow"], engagePotential: "Low", teamArchetypes: ["Poke", "Siege", "ZoneControl", "WaveClear"] },
  { name: "Zilean", primaryRole: "Support", championClass: "Controller", championSubclass: "Specialist", ddragonKey: "Zilean", damageType: "Magic", ccTypes: ["Stun", "Slow"], engagePotential: "Low", teamArchetypes: ["Utility", "Peel", "Revive", "Control"] },
  { name: "Zoe", primaryRole: "Mid", championClass: "Mage", championSubclass: "Burst Mage", ddragonKey: "Zoe", damageType: "Magic", ccTypes: ["Sleep", "Slow"], engagePotential: "Low", teamArchetypes: ["Pick", "BurstMage", "Poke"] }, // Sleep is a pick tool
  { name: "Zyra", primaryRole: "Support", championClass: "Controller", championSubclass: "Catcher", ddragonKey: "Zyra", damageType: "Magic", ccTypes: ["Root", "Knockup", "Slow"], engagePotential: "Medium", teamArchetypes: ["ZoneControl", "Disengage", "Poke", "Teamfight"] },
];

const mapRole = (role: string): Role | undefined => {
    const upperRole = role.toUpperCase();
    switch (upperRole) {
        case 'TOP': return 'TOP';
        case 'JUNGLE': return 'JUNGLE';
        case 'MID': return 'MIDDLE';
        case 'SUPPORT': return 'SUPPORT';
        case 'ADC': return 'BOTTOM';
        default: return undefined;
    }
};

const mapDamageType = (dmg?: 'Physical' | 'Magic' | 'Mixed'): Champion['damageType'] => {
    if (!dmg) return undefined;
    switch (dmg) {
        case 'Physical': return 'AD';
        case 'Magic': return 'AP';
        case 'Mixed': return 'Hybrid';
        default: return undefined;
    }
};

const transformData = (): Record<string, ChampionStaticData> => {
    const record: Record<string, ChampionStaticData> = {};
    for (const champ of staticChampionInfoList) {
        record[champ.ddragonKey] = {
            primaryRole: mapRole(champ.primaryRole),
            championClass: champ.championClass,
            championSubclass: champ.championSubclass,
            damageType: mapDamageType(champ.damageType),
            ccTypes: champ.ccTypes,
            engagePotential: champ.engagePotential,
            teamArchetypes: champ.teamArchetypes,
        };
    }
    return record;
};

export const STATIC_CHAMPION_DATA: Record<string, ChampionStaticData> = transformData();

export const getChampionStaticInfoById = (identifier: string): ChampionStaticInfo | undefined => {
  if (!identifier) return undefined;
  const lowerId = identifier.toLowerCase();
  // Prefer ddragonKey match first
  let champion = staticChampionInfoList.find(c => c.ddragonKey?.toLowerCase() === lowerId);
  if (!champion) {
    champion = staticChampionInfoList.find(c => c.name.toLowerCase() === lowerId);
  }
  return champion;
};