require 'test_helper'

class StylinsControllerTest < ActionController::TestCase
  setup do
    @stylin = stylins(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:stylins)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create stylin" do
    assert_difference('Stylin.count') do
      post :create, stylin: {  }
    end

    assert_redirected_to stylin_path(assigns(:stylin))
  end

  test "should show stylin" do
    get :show, id: @stylin
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @stylin
    assert_response :success
  end

  test "should update stylin" do
    put :update, id: @stylin, stylin: {  }
    assert_redirected_to stylin_path(assigns(:stylin))
  end

  test "should destroy stylin" do
    assert_difference('Stylin.count', -1) do
      delete :destroy, id: @stylin
    end

    assert_redirected_to stylins_path
  end
end
