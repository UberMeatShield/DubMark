class Project
  include MongoMapper::Document

  key :title, String
  key :description, String
  key :organization, String
  key :start_date, String
  key :end_date, String
  key :status, String

end
