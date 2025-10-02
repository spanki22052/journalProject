import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '@shared/lib/auth-context';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

const { Title, Text } = Typography;

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(values);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка входа в систему');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <Title level={2} className={styles.title}>
            Вход в систему
          </Title>
          <Text type="secondary">
            Войдите в свой аккаунт для доступа к журналу
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Пожалуйста, введите email' },
              { type: 'email', message: 'Введите корректный email' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Введите email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: true, message: 'Пожалуйста, введите пароль' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Введите пароль"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
            >
              Войти
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.demoAccounts}>
          <Title level={5}>Демо аккаунты:</Title>
          <Space direction="vertical" size="small">
            <Text code>admin@example.com</Text>
            <Text code>inspector@example.com</Text>
            <Text code>contractor@example.com</Text>
            <Text type="secondary">Пароль для всех: password123</Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};

