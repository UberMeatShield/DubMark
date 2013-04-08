class Sub
  include MongoMapper::Document

  key :sTime, String
  key :eTime, String
  key :source, String
  key :trans, String
  key :lang, String

end
