class Sub
  include MongoMapper::Document

  key :sTime, String
  key :eTime, String
  key :sourceLang, String
  key :transLang, String
  key :source, String
  key :trans, String
  key :projectId, String

end
