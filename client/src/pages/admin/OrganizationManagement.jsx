import { useState, useEffect } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Switch,
  notification,
  Spin,
  Card,
  Statistic,
  Popconfirm,
} from "antd";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiLayers,
  FiShield,
  FiGlobe,
} from "react-icons/fi";
import axios from "axios";
import { useUser } from "../../components/layout/SuperAdminLayout";

const OrganizationManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [form] = Form.useForm();
  const { user } = useUser();

  // Fetch organizations
  const fetchOrganizations = async () => {
    try {
      setTableLoading(true);
      const response = await axios.get("/api/organizations");
      if (response.data.success) {
        setOrganizations(response.data.data);
      }
    } catch (error) {
      notification.error({
        message: "Error Fetching Organizations",
        description:
          error.response?.data?.message || "Could not fetch organizations",
        placement: "bottomRight",
      });
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      let response;

      if (editMode) {
        response = await axios.put(
          `/api/organizations/${selectedOrg.id}`,
          values
        );
      } else {
        response = await axios.post("/api/organizations", values);
      }

      if (response.data.success) {
        notification.success({
          message: `Organization ${
            editMode ? "Updated" : "Created"
          } Successfully`,
          description: response.data.message,
          placement: "bottomRight",
        });
        setModalVisible(false);
        form.resetFields();
        fetchOrganizations();
      }
    } catch (error) {
      notification.error({
        message: `Error ${editMode ? "Updating" : "Creating"} Organization`,
        description: error.response?.data?.message || "Something went wrong",
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (org) => {
    setSelectedOrg(org);
    setEditMode(true);
    form.setFieldsValue({
      name: org.name,
      code: org.code,
      address: org.address,
      phone: org.phone,
      email: org.email,
      website: org.website,
      description: org.description,
      isActive: org.isActive,
    });
    setModalVisible(true);
  };

  const handleDelete = async (org) => {
    try {
      setLoading(true);
      const response = await axios.delete(`/api/organizations/${org.id}`);

      if (response.data.success) {
        notification.success({
          message: "Organization Deleted",
          description: "Organization has been successfully deleted.",
          placement: "bottomRight",
        });
        fetchOrganizations();
      }
    } catch (error) {
      notification.error({
        message: "Delete Failed",
        description:
          error.response?.data?.message || "Failed to delete organization",
        placement: "bottomRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setEditMode(false);
    setSelectedOrg(null);
    form.resetFields();
    setModalVisible(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Organization Management</h1>
        <Button type="primary" icon={<FiPlus />} onClick={showModal}>
          Add Organization
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <Statistic
            title="Total Organizations"
            value={organizations.length}
            prefix={<FiGlobe className="mr-2" />}
          />
        </Card>
        <Card>
          <Statistic
            title="Active Organizations"
            value={organizations.filter((org) => org.isActive).length}
            prefix={<FiLayers className="mr-2" />}
          />
        </Card>
        <Card>
          <Statistic
            title="Total Users"
            value={organizations.reduce(
              (acc, org) => acc + (org._count?.users || 0),
              0
            )}
            prefix={<FiUsers className="mr-2" />}
          />
        </Card>
        <Card>
          <Statistic
            title="Total Admins"
            value={organizations.reduce(
              (acc, org) => acc + (org._count?.admins || 0),
              0
            )}
            prefix={<FiShield className="mr-2" />}
          />
        </Card>
      </div>

      {/* Organizations List */}
      <div className="bg-white rounded-lg shadow">
        {tableLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {organizations.map((org) => (
              <Card
                key={org.id}
                className={!org.isActive ? "bg-red-50" : ""}
                actions={[
                  <Button
                    type="text"
                    icon={<FiEdit2 />}
                    onClick={() => handleEdit(org)}
                  />,
                  <Popconfirm
                    title="Delete Organization"
                    description="Are you sure you want to delete this organization?"
                    onConfirm={() => handleDelete(org)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" danger icon={<FiTrash2 />} />
                  </Popconfirm>,
                ]}
              >
                <Card.Meta
                  title={
                    <div className="flex justify-between items-center">
                      <span>{org.name}</span>
                      <span className="text-sm text-gray-500">{org.code}</span>
                    </div>
                  }
                  description={
                    <div className="space-y-2 mt-2">
                      <p>{org.description}</p>
                      <p className="text-sm">
                        <strong>Address:</strong> {org.address}
                      </p>
                      {org.email && (
                        <p className="text-sm">
                          <strong>Email:</strong> {org.email}
                        </p>
                      )}
                      {org.phone && (
                        <p className="text-sm">
                          <strong>Phone:</strong> {org.phone}
                        </p>
                      )}
                      <div className="flex justify-between text-sm text-gray-500 mt-4">
                        <span>{org._count?.departments || 0} Departments</span>
                        <span>{org._count?.users || 0} Users</span>
                        <span>{org._count?.admins || 0} Admins</span>
                      </div>
                    </div>
                  }
                />
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Organization Modal */}
      <Modal
        title={editMode ? "Edit Organization" : "Add Organization"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="name"
            label="Organization Name"
            rules={[
              { required: true, message: "Please enter organization name" },
              { min: 3, message: "Name must be at least 3 characters" },
            ]}
          >
            <Input placeholder="Enter organization name" />
          </Form.Item>

          <Form.Item
            name="code"
            label="Organization Code"
            rules={[
              { required: true, message: "Please enter organization code" },
              {
                pattern: /^[A-Z0-9-_]+$/,
                message:
                  "Code must contain only uppercase letters, numbers, or - _",
              },
            ]}
          >
            <Input placeholder="Enter organization code (e.g., ORG-001)" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please enter address" }]}
          >
            <Input.TextArea placeholder="Enter organization address" />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number">
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: "email", message: "Please enter a valid email" }]}
          >
            <Input placeholder="Enter organization email" />
          </Form.Item>

          <Form.Item name="website" label="Website">
            <Input placeholder="Enter organization website" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Enter organization description" />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editMode ? "Update" : "Create"} Organization
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default OrganizationManagement;
