import { useState, useEffect } from "react";
import {
  Button,
  Cascader,
  DatePicker,
  Form,
  Modal,
  Input,
  InputNumber,
  Radio,
  Select,
  Switch,
  TreeSelect,
  notification,
  Spin,
  Popconfirm,
} from "antd";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiLock,
} from "react-icons/fi";
import { useUser } from "../../components/layout/SuperAdminLayout";
import axios from "axios";

const { Option } = Select;

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const { user } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [organizations, setOrganizations] = useState([]);

  const fetchUsers = async () => {
    try {
      setTableLoading(true);
      const response = await axios.get("/api/users", {
        params: {
          organizationId: user.organizationId,
        },
      });
      if (response.data.success) {
        setUsers(response.data.data);
      } else {
        notification.error({
          message: "Failed to Fetch Users",
          description: response.data.message || "Could not fetch users list",
          placement: "bottomRight",
          duration: 4,
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      notification.error({
        message: "Error Fetching Users",
        description:
          error.response?.data?.message || "Failed to load users list",
        placement: "bottomRight",
        duration: 4,
      });
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to check if current user can edit target user
  const canEditUser = (targetUser) => {
    if (!user || !targetUser) return false;

    // SUPER_ADMIN can edit anyone
    if (user.role === "SUPER_ADMIN") return true;

    // ADMIN can't edit SUPER_ADMIN or other ADMIN
    if (user.role === "ADMIN") {
      return !["SUPER_ADMIN", "ADMIN"].includes(targetUser.role);
    }

    return false;
  };

  // Function to check if current user can delete target user
  const canDeleteUser = (targetUser) => {
    if (!user || !targetUser) return false;

    // SUPER_ADMIN can delete anyone except themselves
    if (user.role === "SUPER_ADMIN") return user.id !== targetUser.id;

    // ADMIN can't delete SUPER_ADMIN, ADMIN, or themselves
    if (user.role === "ADMIN") {
      return (
        !["SUPER_ADMIN", "ADMIN"].includes(targetUser.role) &&
        user.id !== targetUser.id
      );
    }

    return false;
  };

  // Function to check if current user can update password of target user
  const canUpdatePassword = (targetUser) => {
    if (!user || !targetUser) return false;

    // SUPER_ADMIN can update anyone's password
    if (user.role === "SUPER_ADMIN") return true;

    // ADMIN can update HR, MANAGER, EMPLOYEE passwords
    if (user.role === "ADMIN") {
      return ["HR", "MANAGER", "EMPLOYEE"].includes(targetUser.role);
    }

    // MANAGER can update EMPLOYEE passwords
    if (user.role === "MANAGER") {
      return targetUser.role === "EMPLOYEE";
    }

    return false;
  };

  const handleEdit = (record) => {
    if (!canEditUser(record)) {
      notification.error({
        message: "Access Denied",
        description: "You don't have permission to edit this user.",
        placement: "bottomRight",
      });
      return;
    }

    setSelectedUser(record);
    setEditMode(true);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role,
      isActive: record.isActive,
    });
    setOpen(true);
  };

  const showDeleteModal = (record) => {
    if (!canDeleteUser(record)) {
      notification.error({
        message: "Access Denied",
        description: "You don't have permission to delete this user.",
        placement: "bottomRight",
      });
      return;
    }
    setUserToDelete(record);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await axios.delete(`/api/users/${userToDelete.id}`);

      if (response.data.success) {
        notification.success({
          message: "User Deleted",
          description: "User has been successfully deleted.",
          placement: "bottomRight",
        });
        setDeleteModalVisible(false);
        setUserToDelete(null);
        fetchUsers();
      }
    } catch (error) {
      notification.error({
        message: "Delete Failed",
        description: error.response?.data?.message || "Failed to delete user.",
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (values) => {
    try {
      setLoading(true);
      const response = await axios.put(
        `/api/users/${selectedUser.id}/password`,
        {
          role: selectedUser.role,
          password: values.password,
        }
      );

      if (response.data.success) {
        notification.success({
          message: "Password Updated Successfully",
          description: "User password has been updated.",
          placement: "bottomRight",
          duration: 3,
        });
        setShowPasswordUpdate(false);
        form.resetFields(["password", "confirmPassword"]);
      }
    } catch (error) {
      notification.error({
        message: "Password Update Failed",
        description:
          error.response?.data?.message || "Failed to update password.",
        placement: "bottomRight",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const { confirmPassword, ...userData } = values;

      let response;
      if (editMode) {
        response = await axios.put(`/api/users/${selectedUser.id}`, userData);
      } else {
        response = await axios.post("/api/users", userData);
      }

      if (response.data.success) {
        notification.success({
          message: `User ${editMode ? "Updated" : "Added"} Successfully`,
          description: response.data.message,
          placement: "bottomRight",
          duration: 3,
        });

        setOpen(false);
        form.resetFields();
        fetchUsers();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        `Something went wrong while ${
          editMode ? "updating" : "adding"
        } the user.`;

      notification.error({
        message: `Error ${editMode ? "Updating" : "Adding"} User`,
        description: errorMessage,
        placement: "bottomRight",
        duration: 4,
      });

      if (error.response?.status === 400) {
        form.scrollToField(error.response.data.field);
      }
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setEditMode(false);
    setSelectedUser(null);
    form.resetFields();
    setOpen(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setSelectedUser(null);
    form.resetFields();
    setOpen(false);
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject("Please input your password!");
    }
    if (value.length < 8) {
      return Promise.reject("Password must be at least 8 characters!");
    }
    if (!/\d/.test(value)) {
      return Promise.reject("Password must contain at least one number!");
    }
    if (!/[a-zA-Z]/.test(value)) {
      return Promise.reject("Password must contain at least one letter!");
    }
    return Promise.resolve();
  };

  // Add search and filter functionality
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === "all" ||
      user.role.toLowerCase() === filterRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button type="primary" icon={<FiPlus />} onClick={showModal}>
          Add User
        </Button>
      </div>

      <Modal
        title={editMode ? "Edit User" : "Add User"}
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
          className=""
        >
          <div className="grid grid-cols-1">
            <Form.Item
              name="name"
              label="Full Name"
              rules={[
                { required: true, message: "Please input user's full name!" },
                { min: 3, message: "Name must be at least 3 characters!" },
              ]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input user's email!" },
                {
                  type: "email",
                  message: "Please enter a valid email address!",
                },
              ]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>

            {/* Show password fields for new user or if user has permission to update password */}
            {(!editMode || (editMode && canUpdatePassword(selectedUser))) && (
              <div className="mt-2 mb-4">
                {editMode ? (
                  <Button
                    type="dashed"
                    onClick={() => {
                      form.resetFields(["password", "confirmPassword"]);
                      setShowPasswordUpdate(true);
                    }}
                    className="w-full"
                  >
                    Update Password
                  </Button>
                ) : (
                  <>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[{ validator: validatePassword }]}
                      hasFeedback
                    >
                      <Input.Password placeholder="Enter password" />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      label="Confirm Password"
                      dependencies={["password"]}
                      rules={[
                        { required: true, message: "Please confirm password!" },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject("Passwords do not match!");
                          },
                        }),
                      ]}
                      hasFeedback
                    >
                      <Input.Password placeholder="Confirm password" />
                    </Form.Item>
                  </>
                )}
              </div>
            )}

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: "Please select user role!" }]}
            >
              <Select placeholder="Select user role">
                <Option value="SUPER_ADMIN">Super Admin</Option>
                <Option value="ADMIN">Admin</Option>
                <Option value="HR">HR</Option>
                <Option value="MANAGER">Manager</Option>
                <Option value="EMPLOYEE">Employee</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="organizationId"
              label="Organization"
              rules={[
                { required: true, message: "Please select an organization" },
              ]}
            >
              <Select placeholder="Select organization">
                {organizations.map((org) => (
                  <Option key={org.id} value={org.id}>
                    {org.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="isActive"
            label="Active Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editMode ? "Update" : "Add"} User
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Password Update Modal */}
      <Modal
        title="Update Password"
        open={showPasswordUpdate}
        onCancel={() => {
          setShowPasswordUpdate(false);
          form.resetFields(["password", "confirmPassword"]);
        }}
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePasswordUpdate}
          autoComplete="off"
        >
          <Form.Item
            name="password"
            label="New Password"
            rules={[{ validator: validatePassword }]}
            hasFeedback
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Passwords do not match!");
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={() => setShowPasswordUpdate(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Password
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete User"
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setUserToDelete(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setDeleteModalVisible(false);
              setUserToDelete(null);
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
            Are you sure you want to delete this user?
          </h3>
          {userToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Name:</span> {userToDelete.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Email:</span> {userToDelete.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Role:</span> {userToDelete.role}
              </p>
            </div>
          )}
          <p className="text-red-600 mt-4 text-sm">
            This action cannot be undone. The user will be permanently deleted.
          </p>
        </div>
      </Modal>

      {/* Filters and Search */}
      <div className="flex justify-between items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <select
          className="border rounded-lg px-4 py-2"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="hr">HR</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          {tableLoading ? (
            <div className="flex justify-center items-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "SUPER_ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "ADMIN"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canEditUser(user) && (
                        <button
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          onClick={() => handleEdit(user)}
                        >
                          <FiEdit className="w-5 h-5" />
                        </button>
                      )}
                      {canDeleteUser(user) && (
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => showDeleteModal(user)}
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
