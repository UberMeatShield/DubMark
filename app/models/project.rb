class Project
  include MongoMapper::Document

  key :title, String
  key :description, String
  key :organization, String
  key :create_date, DateTime
  key :start_date, String
  key :end_date, String
  key :status, String
  key :vidUrl, String
  key :vidType, String

end
