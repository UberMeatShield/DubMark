require 'sintra'

class Wizard
  attr_accessor @name, @pet
  def intialize(name, pet)
    @name = name
    @pet  = pet
  end
  def hello
    puts "Hi my name is #{@name} and this is #{@pet.name}\n"
  end
  def abuse_pet
     if self.really() && !@pet.is_deadly
       puts "SMACK #{@pet.noise}"
     end
  end
  def really
    if @name == "Harry"
      return false
    end
    return true
  end
end

class Pet
  attr_accessor @name, @noise
  @talons
  def initialize(name, noise, talons=false)
    @name = name
    @noise = noise
    @talons = talons
  end
  def is_deadly
    return @talons
  end
end

class EpicPet < Pet
  def initialize(@name, @noise)
  end
  def is_deadly
    return true
  end
end

get '/' do
  'Hello world!'
end

#http://localhost:4567/wizard/blythe/pet/scrabble

get '/wizard/:name/pet/:petname' do
  if params['name'].match(/justin/i)
    return "Always ALONE"
  end
  p = Pet.new(params['petname'], "Meow Bitch", true)
  w = Wizard.new(params['name'], p)
  return w.hello()
end



