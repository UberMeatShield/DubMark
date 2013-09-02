class StylinsController < ApplicationController
  # GET /stylins
  # GET /stylins.json
  def index
    @stylins = Stylin.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @stylins }
    end
  end

  # GET /stylins/1
  # GET /stylins/1.json
  def show
    @stylin = Stylin.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @stylin }
    end
  end

  # GET /stylins/new
  # GET /stylins/new.json
  def new
    @stylin = Stylin.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @stylin }
    end
  end

  # GET /stylins/1/edit
  def edit
    @stylin = Stylin.find(params[:id])
  end

  # POST /stylins
  # POST /stylins.json
  def create
    @stylin = Stylin.new(params[:stylin])

    respond_to do |format|
      if @stylin.save
        format.html { redirect_to @stylin, notice: 'Stylin was successfully created.' }
        format.json { render json: @stylin, status: :created, location: @stylin }
      else
        format.html { render action: "new" }
        format.json { render json: @stylin.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /stylins/1
  # PUT /stylins/1.json
  def update
    @stylin = Stylin.find(params[:id])

    respond_to do |format|
      if @stylin.update_attributes(params[:stylin])
        format.html { redirect_to @stylin, notice: 'Stylin was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @stylin.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /stylins/1
  # DELETE /stylins/1.json
  def destroy
    @stylin = Stylin.find(params[:id])
    @stylin.destroy

    respond_to do |format|
      format.html { redirect_to stylins_url }
      format.json { head :no_content }
    end
  end
end
