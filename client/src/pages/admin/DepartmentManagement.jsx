import {
  Button,
  Form,
  Input,
  Modal,
  Select,
  Switch,
  notification,
  Spin,
} from "antd";
import { useState, useEffect } from "react";
import {
  FiChevronRight,
  FiEdit2,
  FiGitBranch,
  FiLayers,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";
import axios from "axios";
import { useUser } from "../../components/layout/SuperAdminLayout";

// Set default axios config
axios.defaults.withCredentials = true;

// Add axios interceptor to handle unauthorized responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      notification.error({
        message: "Authentication Error",
        description: "Please log in to continue",
        placement: "bottomRight",
      });
    } else if (error.response?.status === 403) {
      // Handle forbidden access
      notification.error({
        message: "Access Denied",
        description:
          error.response.data.message ||
          "You don't have permission for this action",
        placement: "bottomRight",
      });
    }
    return Promise.reject(error);
  }
);

const { Option } = Select;

const DepartmentManagement = () => {
  const [activeTab, setActiveTab] = useState("structure");
  const [open, setOpen] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  console.log(departments);
  const [departmentTree, setDepartmentTree] = useState([]);
  console.log(departmentTree);
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);

  const { user } = useUser();

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setTableLoading(true);
      const [deptResponse, hierarchyResponse, usersResponse] =
        await Promise.all([
          axios.get("/api/departments", {
            params: {
              organizationId: user.organizationId,
            },
          }),
          axios.get("/api/departments/hierarchy", {
            params: {
              organizationId: user.organizationId,
            },
          }),
          axios.get("/api/users", {
            params: {
              organizationId: user.organizationId,
            },
          }),
        ]);

      if (deptResponse.data.success) {
        setDepartments(deptResponse.data.data);
      }
      if (hierarchyResponse.data.success) {
        console.log(hierarchyResponse.data);
        setDepartmentTree(hierarchyResponse.data.data);
      }
      if (usersResponse.data.success) {
        setUsers(usersResponse.data.data);
      }
    } catch (error) {
      notification.error({
        message: "Error Fetching Departments",
        description:
          error.response?.data?.message || "Could not fetch departments",
        placement: "bottomRight",
      });
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setEditMode(true);
    form.setFieldsValue({
      name: department.name,
      code: department.code,
      description: department.description,
      location: department.location,
      parentId: department.parentId,
      headId: department.headId,
      isActive: department.isActive,
    });
    setOpen(true);
  };

  const showDeleteModal = (department) => {
    setDepartmentToDelete(department);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(
        `/api/departments/${departmentToDelete.id}`
      );

      if (response.data.success) {
        notification.success({
          message: "Department Deleted",
          description: "Department has been successfully deleted.",
          placement: "bottomRight",
        });
        setDeleteModalVisible(false);
        setDepartmentToDelete(null);
        fetchDepartments();
      }
    } catch (error) {
      notification.error({
        message: "Delete Failed",
        description:
          error.response?.data?.message || "Failed to delete department.",
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      let response;

      if (editMode) {
        response = await axios.put(
          `/api/departments/${selectedDepartment.id}`,
          values
        );
      } else {
        response = await axios.post("/api/departments", values);
      }

      if (response.data.success) {
        notification.success({
          message: `Department ${editMode ? "Updated" : "Added"} Successfully`,
          description: response.data.message,
          placement: "bottomRight",
        });

        setOpen(false);
        form.resetFields();
        fetchDepartments();
      }
    } catch (error) {
      notification.error({
        message: `Error ${editMode ? "Updating" : "Adding"} Department`,
        description: error.response?.data?.message || "Something went wrong",
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setEditMode(false);
    setSelectedDepartment(null);
    form.resetFields();
    setOpen(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setSelectedDepartment(null);
    form.resetFields();
    setOpen(false);
  };

  // Render department tree recursively
  const renderDepartmentTree = (departments) => {
    if (!departments || departments.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          No departments found
        </div>
      );
    }

    return departments.map((dept) => (
      <div key={dept.id} className="border rounded-lg mb-4">
        <div
          className={`p-4 flex justify-between items-center ${
            !dept.isActive ? "bg-red-200" : ""
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-gray-900">{dept.name}</h3>
              {dept.parentDepartment && (
                <span className="text-sm text-gray-500">
                  (Under {dept.parentDepartment.name})
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Code: {dept.code} • Head: {dept.head?.name || "Not Assigned"} •{" "}
              {dept.members?.length || 0} Members
            </p>
            {dept.description && (
              <p className="text-sm text-gray-500 mt-1">{dept.description}</p>
            )}
            {dept.location && (
              <p className="text-sm text-gray-500">Location: {dept.location}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              className="p-2 text-blue-600 hover:text-blue-900"
              onClick={() => handleEdit(dept)}
            >
              <FiEdit2 className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-red-600 hover:text-red-900"
              onClick={() => showDeleteModal(dept)}
            >
              <FiTrash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        {dept.children?.length > 0 && (
          <div className="border-t bg-gray-50 p-4">
            <div className="pl-6 space-y-4">
              {renderDepartmentTree(dept.children)}
            </div>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Department Management</h1>
        <Button
          type="primary"
          onClick={showModal}
          icon={<FiPlus className="mr-2" />}
        >
          Add Department
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Departments",
            value: departments.length,
            icon: FiLayers,
            color: "blue",
          },
          {
            label: "Active Departments",
            value: departments.filter((d) => d.isActive).length,
            icon: FiGitBranch,
            color: "green",
          },
          {
            label: "Department Heads",
            value: departments.filter((d) => d.headId).length,
            icon: FiUsers,
            color: "purple",
          },
          {
            label: "Locations",
            value: [
              ...new Set(departments.map((d) => d.location).filter(Boolean)),
            ].length,
            icon: FiMapPin,
            color: "orange",
          },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <div className="flex">
            {["structure", "locations", "policies"].map((tab) => (
              <button
                key={tab}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {tableLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <>
              {/* Structure Tab */}
              {activeTab === "structure" && (
                <div className="space-y-6">
                  {renderDepartmentTree(departmentTree)}
                </div>
              )}

              {/* Locations Tab */}
              {activeTab === "locations" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    ...new Set(
                      departments.map((d) => d.location).filter(Boolean)
                    ),
                  ].map((location) => {
                    const deptInLocation = departments.filter(
                      (d) => d.location === location
                    );
                    return (
                      <div key={location} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {location}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {deptInLocation.length} Departments
                            </p>
                          </div>
                        </div>
                        <div className="mt-4">
                          {deptInLocation.map((dept) => (
                            <div
                              key={dept.id}
                              className="flex items-center justify-between py-2"
                            >
                              <span className="text-sm text-gray-600">
                                {dept.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {dept.members?.length || 0} members
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Policies Tab */}
              {activeTab === "policies" && (
                <div className="text-center py-8 text-gray-500">
                  Organization policies management to be implemented
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Department Modal */}
      <Modal
        title={editMode ? "Edit Department" : "Add Department"}
        open={open}
        onCancel={handleCancel}
        width={600}
        centered
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="Department Name"
            rules={[
              { required: true, message: "Please input department name!" },
              { min: 3, message: "Name must be at least 3 characters!" },
            ]}
          >
            <Input placeholder="Enter department name" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Department Code"
            rules={[
              { required: true, message: "Please input department code!" },
              {
                pattern: /^[A-Z0-9-_]+$/,
                message:
                  "Code must be uppercase letters, numbers, or symbols - and _",
              },
            ]}
          >
            <Input placeholder="Enter department code (e.g., HR-001)" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Enter department description" />
          </Form.Item>

          <Form.Item name="location" label="Location">
            <Input placeholder="Enter department location" />
          </Form.Item>

          <Form.Item name="parentId" label="Parent Department">
            <Select placeholder="Select parent department" allowClear>
              {departments.map((dept) => (
                <Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="headId" label="Department Head">
            <Select placeholder="Select department head" allowClear>
              {users
                .filter((u) => ["MANAGER", "HR"].includes(u.role))
                .map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="organizationId"
            label="Organization"
            rules={[
              { required: true, message: "Please select an organization" },
            ]}
          >
            <Select
              placeholder="Select organization"
              disabled={user.role !== "SUPER_ADMIN"}
              defaultValue={user.organizationId}
            >
              {organizations.map((org) => (
                <Option key={org.id} value={org.id}>
                  {org.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editMode ? "Update" : "Add"} Department
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Department"
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDepartmentToDelete(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setDeleteModalVisible(false);
              setDepartmentToDelete(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={loading}
            onClick={handleDeleteConfirm}
          >
            Delete
          </Button>,
        ]}
      >
        <div className="py-4">
          <h3 className="text-lg font-medium mb-2">
            Are you sure you want to delete this department?
          </h3>
          {departmentToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Name:</span>{" "}
                {departmentToDelete.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Code:</span>{" "}
                {departmentToDelete.code}
              </p>
              {departmentToDelete.members?.length > 0 && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Members:</span>{" "}
                  {departmentToDelete.members.length} employees
                </p>
              )}
            </div>
          )}
          <p className="text-red-600 mt-4 text-sm">
            This action cannot be undone. All sub-departments will be unlinked.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default DepartmentManagement;
